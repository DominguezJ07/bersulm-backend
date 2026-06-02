/**
 * Sanitize middleware compatible with Express 5
 *
 * Express 5 makes req.query read-only (getter-only),
 * so libraries like express-mongo-sanitize that reassign it
 * throw "Cannot set property query".
 *
 * This version mutates properties in-place instead of reassigning,
 * and strips $ operators / dots from req.body, req.query, req.params.
 */

export function sanitize(req, res, next) {
  const strip = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(strip);
      return;
    }
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (key.startsWith('$') || key.includes('.')) {
        obj[`_${key}`] = value;
        delete obj[key];
        if (typeof value === 'object' && value !== null) {
          strip(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        strip(value);
      }
    });
  };

  strip(req.body);
  strip(req.params);
  strip(req.query);

  next();
}
