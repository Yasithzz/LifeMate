package com.lifemate.backend.service;

import com.lifemate.backend.dto.ScheduleItemRequest;
import com.lifemate.backend.exception.ApiException;
import com.lifemate.backend.model.Schedule;
import com.lifemate.backend.repository.ScheduleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public Schedule getOrGenerate(String userEmail) {
        String today = LocalDate.now().toString();
        return scheduleRepository.findByUserEmailAndScheduleDate(userEmail, today)
                .orElseGet(() -> generate(userEmail, today, null));
    }

    public Schedule generate(String userEmail, String stressLevel) {
        String today = LocalDate.now().toString();
        scheduleRepository.findByUserEmailAndScheduleDate(userEmail, today)
                .ifPresent(s -> scheduleRepository.deleteById(s.getId()));
        return generate(userEmail, today, stressLevel);
    }

    public Schedule getLatest(String userEmail) {
        return scheduleRepository.findTopByUserEmailOrderByCreatedAtDesc(userEmail)
                .orElseGet(() -> getOrGenerate(userEmail));
    }

    public Schedule updateItemStatus(String userEmail, String itemId, String status) {
        Schedule schedule = scheduleRepository.findTopByUserEmailOrderByCreatedAtDesc(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Schedule not found"));
        schedule.getItems().forEach(item -> {
            if (item.getItemId().equals(itemId)) item.setStatus(status);
        });
        return scheduleRepository.save(schedule);
    }

    public Schedule addItem(String userEmail, ScheduleItemRequest req) {
        Schedule schedule = scheduleRepository.findTopByUserEmailOrderByCreatedAtDesc(userEmail)
                .orElseGet(() -> getOrGenerate(userEmail));
        Schedule.ScheduleItem item = new Schedule.ScheduleItem();
        item.setItemId(UUID.randomUUID().toString());
        item.setTitle(req.getTitle());
        item.setStartTime(req.getStartTime());
        item.setEndTime(req.getEndTime());
        item.setActivityType(req.getActivityType());
        item.setStatus(req.getStatus());
        schedule.getItems().add(item);
        schedule.getItems().sort((a, b) -> a.getStartTime().compareTo(b.getStartTime()));
        return scheduleRepository.save(schedule);
    }

    public Schedule deleteItem(String userEmail, String itemId) {
        Schedule schedule = scheduleRepository.findTopByUserEmailOrderByCreatedAtDesc(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Schedule not found"));
        schedule.getItems().removeIf(item -> item.getItemId().equals(itemId));
        return scheduleRepository.save(schedule);
    }

    private Schedule generate(String userEmail, String date, String stressLevel) {
        Schedule s = new Schedule();
        s.setUserEmail(userEmail);
        s.setScheduleDate(date);
        s.setItems(defaultItems(stressLevel));
        return scheduleRepository.save(s);
    }

    private List<Schedule.ScheduleItem> defaultItems(String stressLevel) {
        List<Object[]> raw;
        if ("High".equals(stressLevel)) {
            raw = List.of(
                    new Object[]{"07:00", "07:30", "Exercise", "Light morning stretch"},
                    new Object[]{"07:30", "08:00", "Meal", "Breakfast"},
                    new Object[]{"09:00", "11:00", "Work", "Morning work block"},
                    new Object[]{"11:00", "11:15", "Break", "Mindful break"},
                    new Object[]{"11:15", "12:30", "Work", "Focused work"},
                    new Object[]{"12:30", "13:00", "Meal", "Lunch"},
                    new Object[]{"13:00", "13:30", "Break", "Rest & recharge"},
                    new Object[]{"13:30", "15:30", "Work", "Afternoon work"},
                    new Object[]{"15:30", "15:45", "Break", "Short break"},
                    new Object[]{"16:00", "17:00", "Leisure", "Personal time"},
                    new Object[]{"18:00", "18:45", "Exercise", "Relaxing walk"},
                    new Object[]{"19:00", "19:30", "Meal", "Dinner"},
                    new Object[]{"20:00", "21:30", "Leisure", "Wind down"},
                    new Object[]{"22:30", "07:00", "Sleep", "Rest & recovery"}
            );
        } else {
            raw = List.of(
                    new Object[]{"07:00", "07:30", "Exercise", "Morning workout"},
                    new Object[]{"07:30", "08:00", "Meal", "Breakfast"},
                    new Object[]{"09:00", "12:00", "Work", "Deep work block"},
                    new Object[]{"12:00", "12:30", "Break", "Lunch break"},
                    new Object[]{"12:30", "13:00", "Meal", "Lunch"},
                    new Object[]{"13:00", "15:00", "Work", "Meetings & emails"},
                    new Object[]{"15:00", "15:15", "Break", "Mindful break"},
                    new Object[]{"15:15", "17:00", "Study", "Learning"},
                    new Object[]{"18:00", "19:00", "Exercise", "Evening workout"},
                    new Object[]{"19:00", "19:30", "Meal", "Dinner"},
                    new Object[]{"21:00", "22:00", "Leisure", "Wind down"},
                    new Object[]{"22:30", "07:00", "Sleep", "Sleep"}
            );
        }

        List<Schedule.ScheduleItem> items = new ArrayList<>();
        for (Object[] row : raw) {
            Schedule.ScheduleItem item = new Schedule.ScheduleItem();
            item.setItemId(UUID.randomUUID().toString());
            item.setStartTime((String) row[0]);
            item.setEndTime((String) row[1]);
            item.setActivityType((String) row[2]);
            item.setTitle((String) row[3]);
            items.add(item);
        }
        return items;
    }
}
