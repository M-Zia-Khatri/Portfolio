-- AlterTable
ALTER TABLE `contact_messages` MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `portfolio_items` MODIFY `site_url` VARCHAR(500) NOT NULL,
    MODIFY `site_image_url` VARCHAR(500) NOT NULL,
    MODIFY `description` TEXT NOT NULL;
