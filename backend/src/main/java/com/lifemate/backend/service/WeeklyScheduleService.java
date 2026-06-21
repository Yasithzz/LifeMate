package com.lifemate.backend.service;

import com.lifemate.backend.model.HolidayLeave;
import com.lifemate.backend.model.User;
import com.lifemate.backend.model.WeeklySchedule;
import com.lifemate.backend.model.WeeklySchedule.DaySlot;
import com.lifemate.backend.repository.HolidayLeaveRepository;
import com.lifemate.backend.repository.WeeklyScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class WeeklyScheduleService {

    private final WeeklyScheduleRepository repo;
    private final HolidayLeaveRepository hlRepo;

    public WeeklyScheduleService(WeeklyScheduleRepository repo, HolidayLeaveRepository hlRepo) {
        this.repo   = repo;
        this.hlRepo = hlRepo;
    }

    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    // ── Public API ─────────────────────────────────────────────────

    public WeeklySchedule generateForCurrentWeek(String userEmail, int stressIndex, String stressLevel, User user) {
        LocalDate monday = mondayOfCurrentWeek();
        // Delete ALL existing docs for this user+week (prevents duplicate-doc crashes)
        repo.deleteAllByUserEmailAndWeekStartDate(userEmail, monday.format(FMT));
        return buildAndSave(userEmail, stressIndex, stressLevel, user, monday);
    }

    public WeeklySchedule getLatestOrGenerate(String userEmail, int stressIndex, String stressLevel, User user) {
        LocalDate monday = mondayOfCurrentWeek();
        List<com.lifemate.backend.model.WeeklySchedule> existing =
                repo.findByUserEmailAndWeekStartDate(userEmail, monday.format(FMT));
        if (!existing.isEmpty()) {
            // Keep only the most recent; delete extras if duplicates crept in
            if (existing.size() > 1) {
                existing.stream().skip(1).forEach(repo::delete);
            }
            return existing.get(0);
        }
        return buildAndSave(userEmail, stressIndex, stressLevel, user, monday);
    }

    public Optional<WeeklySchedule> getLatest(String userEmail) {
        return repo.findTopByUserEmailOrderByGeneratedAtDesc(userEmail);
    }

    public WeeklySchedule updateSlotStatus(String userEmail, String day, String itemId, String status) {
        WeeklySchedule ws = repo.findTopByUserEmailOrderByGeneratedAtDesc(userEmail)
                .orElseThrow(() -> new RuntimeException("No schedule found"));
        List<DaySlot> slots = ws.getDays().getOrDefault(day, List.of());
        slots.forEach(s -> { if (s.getItemId().equals(itemId)) s.setStatus(status); });
        ws.setUserModified(true);
        return repo.save(ws);
    }

    public WeeklySchedule addCustomSlot(String userEmail, String day, DaySlot slot) {
        WeeklySchedule ws = repo.findTopByUserEmailOrderByGeneratedAtDesc(userEmail)
                .orElseThrow(() -> new RuntimeException("No schedule found"));
        slot.setItemId(UUID.randomUUID().toString());
        ws.getDays().computeIfAbsent(day, k -> new ArrayList<>()).add(slot);
        sortDay(ws.getDays().get(day));
        ws.setUserModified(true);
        return repo.save(ws);
    }

    public WeeklySchedule removeSlot(String userEmail, String day, String itemId) {
        WeeklySchedule ws = repo.findTopByUserEmailOrderByGeneratedAtDesc(userEmail)
                .orElseThrow(() -> new RuntimeException("No schedule found"));
        ws.getDays().getOrDefault(day, List.of()).removeIf(s -> s.getItemId().equals(itemId));
        ws.setUserModified(true);
        return repo.save(ws);
    }

    // ── Private builders ────────────────────────────────────────────

    private WeeklySchedule buildAndSave(String userEmail, int stressIndex, String stressLevel,
                                         User user, LocalDate monday) {
        // Collect leave / holiday dates for the week
        List<String> weekDates = new ArrayList<>();
        for (int i = 0; i < 7; i++) weekDates.add(monday.plusDays(i).format(FMT));
        Set<String> leaveDates = new HashSet<>(
            hlRepo.findByUserEmailOrderByDateAsc(userEmail).stream()
                .map(HolidayLeave::getDate).filter(weekDates::contains).toList());

        WeeklySchedule ws = new WeeklySchedule();
        ws.setUserEmail(userEmail);
        ws.setWeekStartDate(monday.format(FMT));
        ws.setStressLevel(stressLevel);
        ws.setStressIndex(stressIndex);
        ws.setLeaveDays(new ArrayList<>(leaveDates));

        String[] DAYS = {"MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"};
        // User-configured working days; default Mon–Fri if not set
        java.util.Set<String> workingDaySet = new HashSet<>(
            user.getWorkingDays() != null && !user.getWorkingDays().isEmpty()
                ? user.getWorkingDays()
                : List.of("MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"));

        for (int i = 0; i < 7; i++) {
            LocalDate date      = monday.plusDays(i);
            String dateStr      = date.format(FMT);
            boolean isLeave     = leaveDates.contains(dateStr);
            boolean isWorkingDay = workingDaySet.contains(DAYS[i]);
            ws.getDays().put(DAYS[i], isLeave
                    ? leaveSlots()
                    : buildDay(stressIndex, !isWorkingDay, user));
        }
        return repo.save(ws);
    }

    private List<DaySlot> leaveSlots() {
        return List.of(
            slot("00:00","23:59","Other","Rest Day / Holiday","pending"));
    }

    private List<DaySlot> buildDay(int stress, boolean weekend, User user) {
        String wake    = nvl(user.getWakeTime(),    "07:00");
        String bed     = nvl(user.getSleepSchedule(),"22:30");
        String[] wWork = parseWorkHours(nvl(user.getWorkHours(),"09:00-17:00"));
        String  wp     = nvl(user.getWorkoutPreference(), "Moderate");
        String  ft     = nvl(user.getFreeTimePreference(),"Reading");
        String  mp     = nvl(user.getMealPreference(), "Balanced");
        boolean noExercise = "None".equalsIgnoreCase(wp);

        List<DaySlot> s = new ArrayList<>();

        // ── Sleep / wake ──
        s.add(slot("00:00", wake, "Sleep", "Sleep", "pending"));

        // Morning routine (longer for high stress)
        int mrMins = stress >= 3 ? 30 : 20;
        s.add(slot(wake, addMins(wake, mrMins), "Other", "Morning Routine & Freshen Up", "pending"));

        // Breakfast
        String bfStart = addMins(wake, mrMins);
        s.add(slot(bfStart, addMins(bfStart, 20), "Meal",
                mealName(mp, "Breakfast"), "pending"));

        if (!weekend) {
            // ── Weekday ──────────────────────────────────────────
            String workStart = stress >= 4 ? addMins(wWork[0], 30) : wWork[0];
            String workEnd   = stress >= 4 ? subtractMins(wWork[1], 60)
                             : stress == 3 ? subtractMins(wWork[1], 30)
                             : wWork[1];

            // Pre-work exercise (if enough time and not high stress)
            if (!noExercise && stress <= 2) {
                String exStart = addMins(bfStart, 25);
                String exEnd   = addMins(exStart, stress == 0 ? 40 : 30);
                if (compareTimes(exEnd, workStart) <= 0)
                    s.add(slot(exStart, exEnd, "Exercise", exerciseName(wp, stress), "pending"));
            }

            // Work blocks with breaks
            String wCursor = workStart;
            int blockLen   = stress >= 4 ? 45 : stress == 3 ? 75 : 90;  // mins per focus block
            int breakLen   = stress >= 4 ? 20 : stress == 3 ? 15 : 10;
            int blockCount = 0;
            while (compareTimes(addMins(wCursor, blockLen), workEnd) <= 0 && blockCount < 4) {
                String wEnd = addMins(wCursor, blockLen);
                s.add(slot(wCursor, wEnd, "Work",
                    blockCount == 0 ? "Morning Focus Block" : blockCount == 2 ? "Afternoon Work Block" : "Work Session", "pending"));
                // Lunch break after 2nd block
                if (blockCount == 1) {
                    String lunchEnd = addMins(wEnd, 15 + breakLen);
                    s.add(slot(wEnd, addMins(wEnd, 15), "Break", "Break & Rest", "pending"));
                    s.add(slot(addMins(wEnd,15), lunchEnd, "Meal", mealName(mp,"Lunch"), "pending"));
                    wCursor = lunchEnd;
                } else {
                    String bEnd = addMins(wEnd, breakLen);
                    s.add(slot(wEnd, bEnd, "Break",
                        stress >= 3 ? "Mindful Break (Breathe / Walk)" : "Short Break", "pending"));
                    wCursor = bEnd;
                }
                blockCount++;
            }
            // Ensure we end work
            if (compareTimes(wCursor, workEnd) < 0)
                s.add(slot(wCursor, workEnd, "Work", "Wrap Up & Plan Tomorrow", "pending"));

            // Evening exercise (afternoon/evening, not high stress)
            if (!noExercise && stress <= 2) {
                String exS = addMins(workEnd, 30);
                String exE = addMins(exS, stress == 0 ? 50 : 40);
                s.add(slot(exS, exE, "Exercise", exerciseName(wp, stress), "pending"));
            } else if (!noExercise && stress == 3) {
                // Light walk for medium-high stress
                String exS = addMins(workEnd, 30);
                s.add(slot(exS, addMins(exS, 30), "Exercise", "Light Walk / Gentle Stretch", "pending"));
            }

        } else {
            // ── Weekend ──────────────────────────────────────────
            if (!noExercise && stress <= 3) {
                String exS = addMins(bfStart, 30);
                String exE = addMins(exS, stress >= 3 ? 30 : stress <= 1 ? 60 : 45);
                s.add(slot(exS, exE, "Exercise", exerciseName(wp, stress), "pending"));
            }
            // Leisure morning
            String leisStart = addMins(bfStart, noExercise ? 20 : 100);
            s.add(slot(leisStart, addMins(leisStart, 90), "Leisure", "Morning Leisure — " + ft, "pending"));
        }

        // Dinner (fixed ~18:00-18:30 for weekday, flexible weekend)
        String dinnerS = weekend ? "18:00" : addMins(nvl(wWork[1],"17:00"), 60);
        dinnerS = clampTime(dinnerS, "17:30", "19:30");
        s.add(slot(dinnerS, addMins(dinnerS, 30), "Meal", mealName(mp, "Dinner"), "pending"));

        // Evening free time
        String ftS = addMins(dinnerS, 35);
        String ftE = subtractMins(bed, stress >= 3 ? 45 : 30);
        if (compareTimes(ftS, ftE) < 0)
            s.add(slot(ftS, ftE, "Leisure", "Evening — " + ft, "pending"));

        // Wind down (longer for high stress)
        String wdLen = stress >= 3 ? "45" : "30";
        String wdS   = subtractMins(bed, Integer.parseInt(wdLen));
        s.add(slot(wdS, bed, "Other", stress >= 3 ? "Wind Down & Relaxation Routine" : "Wind Down", "pending"));

        // Bed
        s.add(slot(bed, "23:59", "Sleep", "Sleep & Recovery", "pending"));

        // Sort & dedupe
        sortDay(s);
        assignIds(s);
        return s;
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private DaySlot slot(String s, String e, String type, String title, String status) {
        DaySlot d = new DaySlot();
        d.setStartTime(s); d.setEndTime(e); d.setActivityType(type);
        d.setTitle(title); d.setStatus(status);
        d.setItemId(UUID.randomUUID().toString());
        return d;
    }

    private void sortDay(List<DaySlot> slots) {
        slots.sort(Comparator.comparing(DaySlot::getStartTime));
    }

    private void assignIds(List<DaySlot> slots) {
        slots.forEach(s -> { if (s.getItemId() == null) s.setItemId(UUID.randomUUID().toString()); });
    }

    private String nvl(String v, String def) { return v != null && !v.isBlank() ? v : def; }

    private String[] parseWorkHours(String wh) {
        String[] p = wh.split("-");
        return p.length == 2 ? p : new String[]{"09:00","17:00"};
    }

    private String addMins(String time, int mins) {
        int[] t = parseTime(time);
        int total = t[0]*60 + t[1] + mins;
        return fmt(total/60, total%60);
    }

    private String subtractMins(String time, int mins) {
        int[] t = parseTime(time);
        int total = Math.max(0, t[0]*60 + t[1] - mins);
        return fmt(total/60, total%60);
    }

    private int[] parseTime(String t) {
        String[] p = t.split(":");
        return new int[]{Integer.parseInt(p[0]), Integer.parseInt(p[1])};
    }

    private String fmt(int h, int m) {
        return String.format("%02d:%02d", Math.min(23,h), Math.min(59,m));
    }

    private int compareTimes(String a, String b) {
        return a.compareTo(b);
    }

    private String clampTime(String t, String lo, String hi) {
        if (compareTimes(t, lo) < 0) return lo;
        if (compareTimes(t, hi) > 0) return hi;
        return t;
    }

    private String exerciseName(String pref, int stress) {
        if (stress >= 4) return "Gentle Yoga / Breathing Exercises";
        if (stress == 3) return "Light Walk or Stretching";
        return switch (pref.toLowerCase()) {
            case "intense" -> "High-Intensity Workout (HIIT / Running)";
            case "light"   -> "Light Walk or Yoga";
            default        -> "Moderate Exercise (Cycling / Gym)";
        };
    }

    private String mealName(String pref, String mealType) {
        String base = switch (pref.toLowerCase()) {
            case "vegetarian","vegan" -> "Plant-Based ";
            case "high-protein"       -> "High-Protein ";
            case "keto"               -> "Keto ";
            case "mediterranean"      -> "Mediterranean-Style ";
            default                   -> "";
        };
        return base + mealType;
    }

    private LocalDate mondayOfCurrentWeek() {
        LocalDate today = LocalDate.now();
        return today.with(DayOfWeek.MONDAY);
    }
}
