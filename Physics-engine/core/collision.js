/**
 * Collision Detection Utilities
 * Optimized collision detection for physics engine
 */

import { Vec } from "./vector.js";

/**
 * Check collision between circle and rectangle
 * @param {Vec} circlePos - Circle center position
 * @param {number} circleRadius - Circle radius
 * @param {Vec} rectPos - Rectangle position (top-left)
 * @param {number} rectWidth - Rectangle width
 * @param {number} rectHeight - Rectangle height
 * @returns {Object|null} Collision info or null if no collision
 */
export function circleRect(
  circlePos,
  circleRadius,
  rectPos,
  rectWidth,
  rectHeight
) {
  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(
    rectPos.x,
    Math.min(circlePos.x, rectPos.x + rectWidth)
  );
  const closestY = Math.max(
    rectPos.y,
    Math.min(circlePos.y, rectPos.y + rectHeight)
  );

  // Calculate distance from circle center to closest point
  const distanceX = circlePos.x - closestX;
  const distanceY = circlePos.y - closestY;
  const distanceSquared = distanceX * distanceX + distanceY * distanceY;

  // Check if collision occurred
  if (distanceSquared < circleRadius * circleRadius) {
    const distance = Math.sqrt(distanceSquared);

    // Calculate normal vector (direction to push circle out)
    let normalX, normalY;

    if (distance === 0) {
      // Circle center is inside rectangle - use center to center direction
      const rectCenterX = rectPos.x + rectWidth / 2;
      const rectCenterY = rectPos.y + rectHeight / 2;
      normalX = circlePos.x - rectCenterX;
      normalY = circlePos.y - rectCenterY;
      const mag = Math.sqrt(normalX * normalX + normalY * normalY);
      if (mag > 0) {
        normalX /= mag;
        normalY /= mag;
      } else {
        normalX = 1;
        normalY = 0;
      }
    } else {
      normalX = distanceX / distance;
      normalY = distanceY / distance;
    }

    return {
      collision: true,
      normal: new Vec(normalX, normalY),
      penetration: circleRadius - distance,
      contactPoint: new Vec(closestX, closestY),
    };
  }

  return null;
}

/**
 * Check collision between two circles
 * @param {Vec} pos1 - First circle position
 * @param {number} radius1 - First circle radius
 * @param {Vec} pos2 - Second circle position
 * @param {number} radius2 - Second circle radius
 * @returns {Object|null} Collision info or null if no collision
 */
export function circleCircle(pos1, radius1, pos2, radius2) {
  const dx = pos2.x - pos1.x;
  const dy = pos2.y - pos1.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = radius1 + radius2;

  if (distanceSquared < radiusSum * radiusSum) {
    const distance = Math.sqrt(distanceSquared);

    let normalX, normalY;
    if (distance === 0) {
      // Circles are at same position
      normalX = 1;
      normalY = 0;
    } else {
      normalX = dx / distance;
      normalY = dy / distance;
    }

    return {
      collision: true,
      normal: new Vec(normalX, normalY),
      penetration: radiusSum - distance,
      contactPoint: new Vec(
        pos1.x + normalX * radius1,
        pos1.y + normalY * radius1
      ),
    };
  }

  return null;
}

/**
 * Check if point is inside circle
 * @param {Vec} point - Point to test
 * @param {Vec} circlePos - Circle center
 * @param {number} radius - Circle radius
 * @returns {boolean} True if point is inside circle
 */
export function pointInCircle(point, circlePos, radius) {
  const dx = point.x - circlePos.x;
  const dy = point.y - circlePos.y;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Check if point is inside rectangle
 * @param {Vec} point - Point to test
 * @param {Vec} rectPos - Rectangle position (top-left)
 * @param {number} width - Rectangle width
 * @param {number} height - Rectangle height
 * @returns {boolean} True if point is inside rectangle
 */
export function pointInRect(point, rectPos, width, height) {
  return (
    point.x >= rectPos.x &&
    point.x <= rectPos.x + width &&
    point.y >= rectPos.y &&
    point.y <= rectPos.y + height
  );
}
