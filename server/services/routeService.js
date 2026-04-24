/**
 * Calculate distance between two points using Haversine formula (in km)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

/**
 * Check if a point is "on the way" between start and end
 * We use a simple perpendicular distance threshold
 */
const isPointNearRoute = (start, end, point, thresholdKm = 3) => {
    // 1. Check if point is roughly in the same direction
    const distStartPoint = calculateDistance(start.lat, start.lng, point.lat, point.lng);
    const distEndPoint = calculateDistance(end.lat, end.lng, point.lat, point.lng);
    const distStartEnd = calculateDistance(start.lat, start.lng, end.lat, end.lng);

    // If point is further from both than they are from each other, it's probably not "on the way"
    if (distStartPoint > distStartEnd && distEndPoint > distStartEnd) return false;

    // 2. Simple geometric check: if (distStartPoint + distEndPoint) is close to distStartEnd
    // it means it's on or near the line segment.
    const overhead = (distStartPoint + distEndPoint) - distStartEnd;
    
    // threshold here is a bit heuristic. Let's say if it adds less than thresholdKm to the trip
    return overhead <= thresholdKm;
};

/**
 * Optimized sequence for multiple stops
 * Nearest Neighbor approach for simplicity
 */
const optimizeRouteSequence = (riderLoc, stops) => {
    let currentLoc = riderLoc;
    const unvisited = [...stops];
    const sequence = [];

    while (unvisited.length > 0) {
        let nearestIdx = 0;
        let minDist = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const d = calculateDistance(
                currentLoc.lat, currentLoc.lng, 
                unvisited[i].shippingAddress.lat, unvisited[i].shippingAddress.lng
            );
            if (d < minDist) {
                minDist = d;
                nearestIdx = i;
            }
        }

        const nextStop = unvisited.splice(nearestIdx, 1)[0];
        sequence.push(nextStop);
        currentLoc = { 
            lat: nextStop.shippingAddress.lat, 
            lng: nextStop.shippingAddress.lng 
        };
    }

    return sequence;
};

module.exports = {
    calculateDistance,
    isPointNearRoute,
    optimizeRouteSequence
};
