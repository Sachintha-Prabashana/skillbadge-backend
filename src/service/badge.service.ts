import {User} from "../models/user.model";
import {Badge} from "../models/badge.model";


export const checkAndAwardBadges = async (userId: string) => {
    const newBadges: any[] = [];

    // 1. Fetch User (with their current badges populated)
    const user = await User.findById(userId);
    if (!user) return [];

    // 2. Fetch ALL defined badges from DB
    const allBadges = await Badge.find({});

    // 3. Evaluate Rules
    for (const badge of allBadges) {
        // Skip if user already owns this badge
        if (user.badges.includes(badge._id)) continue;

        let isEligible = false;

        switch (badge.criteriaType) {
            case "POINTS":
                if (user.points >= badge.criteriaValue) isEligible = true;
                break;

            case "SOLVED_TOTAL":
                if (user.completedChallenges.length >= badge.criteriaValue) isEligible = true;
                break;

            case "STREAK":
                if (user.currentStreak >= badge.criteriaValue) isEligible = true;
                break;
        }

        // 4. Award the Badge
        if (isEligible) {
            user.badges.push(badge._id);
            newBadges.push(badge); // Add to list to return to frontend
        }
    }

    // 5. Save changes if any badges were awarded
    if (newBadges.length > 0) {
        await user.save();
    }

    return newBadges;
};