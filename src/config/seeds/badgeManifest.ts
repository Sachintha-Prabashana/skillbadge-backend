export const BADGE_MANIFEST = [
    {
        name: "Rising Star",
        description: "Reach 200 XP",
        icon: "Star",
        color: "text-orange-400",
        criteriaType: "POINTS",
        criteriaValue: 200,
    },
    {
        name: "Code Warrior",
        description: "Reach 350 XP",
        icon: "Sword",
        color: "text-slate-400", // Silver-ish
        criteriaType: "POINTS",
        criteriaValue: 350
    },
    {
        name: "Grandmaster",
        description: "Reach 500 XP",
        icon: "Crown",
        color: "text-yellow-400", // Gold
        criteriaType: "POINTS",
        criteriaValue: 500
    },
    {
        name: "Hard Hitter I",
        description: "Solve 10 Hard Challenges",
        icon: "Hammer",
        criteriaType: "SOLVED_HARD",
        criteriaValue: 10
    },
    {
        name: "Hard Hitter II",
        description: "Solve 20 Hard Challenges",
        icon: "Axe",
        criteriaType: "SOLVED_HARD",
        criteriaValue: 20
    },

    // --- 3. STREAK ---
    {
        name: "Weekly Warrior",
        description: "Maintain a 7-day streak",
        icon: "Flame",
        color: "text-red-500",
        criteriaType: "STREAK",
        criteriaValue: 7
    }
]