package com.example.hansei.recruitmentapi.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hansei.entity.HanUser;
import com.example.hansei.recruitmentapi.dto.EventDto;
import com.example.hansei.recruitmentapi.service.EventFavoriteService;
import com.example.hansei.recruitmentapi.service.EventService;
import com.example.hansei.security.user.CustomUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/work-favorites")
@RequiredArgsConstructor
public class EventFavoriteController {

    private final EventFavoriteService eventFavoriteService;
    private final EventService eventService;

    // 📌 즐겨찾기 추가
    @PostMapping("/{eventNo}")
    public ResponseEntity<String> addFavorite(@AuthenticationPrincipal CustomUser customUser,
                                              @PathVariable String eventNo) {
        if (customUser == null) {
            return ResponseEntity.status(401).body("인증이 필요합니다.");
        }

        HanUser user = customUser.getUser();
        eventFavoriteService.addFavorite(user.getUserId(), eventNo);

        return ResponseEntity.ok("즐겨찾기에 추가되었습니다.");
    }

    // 📌 즐겨찾기 삭제
    @DeleteMapping("/{eventNo}")
    public ResponseEntity<String> removeFavorite(@AuthenticationPrincipal CustomUser customUser,
                                                 @PathVariable String eventNo) {
        if (customUser == null) {
            return ResponseEntity.status(401).body("인증이 필요합니다.");
        }

        HanUser user = customUser.getUser();
        eventFavoriteService.removeFavorite(user.getUserId(), eventNo);

        return ResponseEntity.ok("즐겨찾기에서 삭제되었습니다.");
    }

    // 📌 사용자의 즐겨찾기 목록 조회
//    @GetMapping
//    public ResponseEntity<List<EventDto>> getUserFavorites(@AuthenticationPrincipal CustomUser customUser) {
//        if (customUser == null) {
//            return ResponseEntity.status(401).body(null);
//        }
//
//        HanUser user = customUser.getUser();
//        List<EventDto> favorites = eventFavoriteService.getUserFavorites(user.getUserId());
//
//        return ResponseEntity.ok(favorites);
//    }
    
    @GetMapping
    public ResponseEntity<List<EventDto>> getUserFavoriteEvents(@AuthenticationPrincipal CustomUser customUser) {
        if (customUser == null) {
            return ResponseEntity.status(401).body(null);
        }

        HanUser user = customUser.getUser();
        List<EventDto> favoriteEvents = eventService.getFavoriteEvents(user.getUserId());

        return ResponseEntity.ok(favoriteEvents);
    }

}
