package com.prodapt.flowable.config;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

@Component("flowUtils")
public class FlowUtils {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    /**
     * Subtracts the specified number of days from the given date/time string
     * and returns the result as an ISO instant string.
     *
     * @param dateTime ISO instant string (e.g., "2025-11-14T17:53:11.030Z" or "2025-11-15T14:00Z")
     * @param days Number of days to subtract
     * @return ISO instant string of the calculated date/time
     */
    public static String minusDays(String dateTime, int days) {
        try {
            ZonedDateTime zdt = parseFlexibleDateTime(dateTime);
            ZonedDateTime result = zdt.minusDays(days);
            return result.toInstant().toString();
        } catch (Exception e) {
            throw new RuntimeException("Error parsing date/time: " + dateTime, e);
        }
    }

    /**
     * Calculates the number of days between now and the given date/time.
     * Returns the difference as a double (can be fractional).
     *
     * @param dateTime ISO instant string (e.g., "2025-11-14T17:53:11.030Z" or "2025-11-15T14:00Z")
     * @return Number of days between now and the given date/time
     */
    public static double daysBetweenNow(String dateTime) {
        try {
            Instant targetInstant = parseFlexibleInstant(dateTime);
            Instant now = Instant.now();
            long secondsDiff = targetInstant.getEpochSecond() - now.getEpochSecond();
            return secondsDiff / (1000.0 * 60 * 60 * 24);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing date/time: " + dateTime, e);
        }
    }

    /**
     * Parses a date/time string and returns it as an ISO instant string.
     * This is a utility method for consistency.
     *
     * @param dateTime ISO instant string
     * @return The same string (for validation/consistency)
     */
    public static String parseDateTime(String dateTime) {
        try {
            Instant.parse(dateTime); // Validate
            return dateTime;
        } catch (Exception e) {
            throw new RuntimeException("Error parsing date/time: " + dateTime, e);
        }
    }

    /**
     * Flexibly parses a date/time string that may be missing seconds.
     * Handles both "2025-11-15T14:00:00Z" and "2025-11-15T14:00Z" formats.
     *
     * @param dateTime The date/time string to parse
     * @return ZonedDateTime object
     */
    private static ZonedDateTime parseFlexibleDateTime(String dateTime) {
        try {
            // First try parsing as-is (handles full ISO format)
            return ZonedDateTime.parse(dateTime);
        } catch (Exception e) {
            // If that fails, try adding seconds if missing
            if (dateTime.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}Z")) {
                // Format is "YYYY-MM-DDTHH:MMZ" - add seconds
                String withSeconds = dateTime.replace("Z", ":00Z");
                return ZonedDateTime.parse(withSeconds);
            }
            // Re-throw original exception if we can't fix it
            throw new RuntimeException("Unable to parse date/time: " + dateTime, e);
        }
    }

    /**
     * Flexibly parses a date/time string that may be missing seconds into an Instant.
     * Handles both "2025-11-15T14:00:00Z" and "2025-11-15T14:00Z" formats.
     *
     * @param dateTime The date/time string to parse
     * @return Instant object
     */
    private static Instant parseFlexibleInstant(String dateTime) {
        try {
            // First try parsing as-is (handles full ISO format)
            return Instant.parse(dateTime);
        } catch (Exception e) {
            // If that fails, try adding seconds if missing
            if (dateTime.matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}Z")) {
                // Format is "YYYY-MM-DDTHH:MMZ" - add seconds
                String withSeconds = dateTime.replace("Z", ":00Z");
                return Instant.parse(withSeconds);
            }
            // Re-throw original exception if we can't fix it
            throw new RuntimeException("Unable to parse date/time: " + dateTime);
        }
    }
}
