-- CreateTable
CREATE TABLE `visitor` (
    `id` VARCHAR(191) NOT NULL,
    `anonymous_id` VARCHAR(191) NOT NULL,
    `first_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `visit_count` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `visitor_anonymous_id_key`(`anonymous_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `visitor_id` VARCHAR(191) NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_seen_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ended_at` DATETIME(3) NULL,
    `landing_page` VARCHAR(191) NULL,
    `exit_page` VARCHAR(191) NULL,
    `referrer` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `device_type` VARCHAR(191) NULL,
    `browser` VARCHAR(191) NULL,
    `os` VARCHAR(191) NULL,
    `screen_width` INTEGER NULL,
    `screen_height` INTEGER NULL,

    INDEX `session_visitor_id_idx`(`visitor_id`),
    INDEX `session_started_at_idx`(`started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_view` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ended_at` DATETIME(3) NULL,
    `duration_ms` INTEGER NULL,

    INDEX `page_view_session_id_idx`(`session_id`),
    INDEX `page_view_path_idx`(`path`),
    INDEX `page_view_started_at_idx`(`started_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_event` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` JSON NULL,

    INDEX `analytics_event_session_id_idx`(`session_id`),
    INDEX `analytics_event_type_idx`(`type`),
    INDEX `analytics_event_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_daily` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `visitors` INTEGER NOT NULL DEFAULT 0,
    `sessions` INTEGER NOT NULL DEFAULT 0,
    `page_views` INTEGER NOT NULL DEFAULT 0,
    `contact_opens` INTEGER NOT NULL DEFAULT 0,
    `contact_submits` INTEGER NOT NULL DEFAULT 0,
    `game_starts` INTEGER NOT NULL DEFAULT 0,
    `game_completions` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `analytics_daily_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_project_daily` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `demo_clicks` INTEGER NOT NULL DEFAULT 0,
    `github_clicks` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `analytics_project_daily_date_project_id_key`(`date`, `project_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_visitor_id_fkey` FOREIGN KEY (`visitor_id`) REFERENCES `visitor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_view` ADD CONSTRAINT `page_view_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_event` ADD CONSTRAINT `analytics_event_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
