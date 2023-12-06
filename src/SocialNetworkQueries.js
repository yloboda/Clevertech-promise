export class SocialNetworkQueries {

    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser;
        this.lastData = null;
    }

    findPotentialLikes(minimalScores) {
        return this.fetchCurrentUser()
            .then(userData => {
                this.lastData = userData
                return this.calculatePotentialLikes(userData, minimalScores);
            })
            .catch(() => {
                if (this.lastData) {
                    return this.calculatePotentialLikes(this.lastData, minimalScores);
                } else {
                    return [];
                }
            });
    }

    calculatePotentialLikes(userData, minimalScores) {
        if (!userData || !userData.likes || !userData.friends) {
            return [];
        }

        const userLikes = new Set(userData.likes);
        const bookScores = {};
        const friendsCount = userData.friends.length;

        userData.friends.forEach(friend => {
            if (friend && friend.likes) {
                new Set(friend.likes).forEach(book => {
                    if (!userLikes.has(book)) {
                        bookScores[book] = (bookScores[book] || 0) + 1;
                    }
                });
            }
        });

        let potentialLikes = Object.keys(bookScores)
            .filter(book => (bookScores[book] / friendsCount) >= minimalScores)
            .sort((a, b) => {
                const countDiff = bookScores[b] - bookScores[a];
                if (countDiff !== 0) return countDiff;
                return a.localeCompare(b);
            });

        return potentialLikes;
    }
}
