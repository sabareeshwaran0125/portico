package com.portico.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice_reads", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"notice_id", "user_id"})
})
public class NoticeRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    private Notice notice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "read_at", updatable = false)
    private LocalDateTime readAt;

    // Constructors
    public NoticeRead() {
    }

    public NoticeRead(Long id, Notice notice, User user, LocalDateTime readAt) {
        this.id = id;
        this.notice = notice;
        this.user = user;
        this.readAt = readAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Notice getNotice() { return notice; }
    public void setNotice(Notice notice) { this.notice = notice; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    // Builder Implementation
    public static NoticeReadBuilder builder() {
        return new NoticeReadBuilder();
    }

    public static class NoticeReadBuilder {
        private Long id;
        private Notice notice;
        private User user;
        private LocalDateTime readAt;

        public NoticeReadBuilder id(Long id) { this.id = id; return this; }
        public NoticeReadBuilder notice(Notice notice) { this.notice = notice; return this; }
        public NoticeReadBuilder user(User user) { this.user = user; return this; }
        public NoticeReadBuilder readAt(LocalDateTime readAt) { this.readAt = readAt; return this; }

        public NoticeRead build() {
            return new NoticeRead(id, notice, user, readAt);
        }
    }
}
