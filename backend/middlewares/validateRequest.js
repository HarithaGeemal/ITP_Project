import { ZodError } from "zod";

/**
 * Express middleware to validate req.body, req.query, and req.params against Zod schemas.
 * @param {Object} schemas - { body?, query?, params? }
 */
export const validateRequest = (schemas) => {
    return (req, res, next) => {
        try {
            if (schemas.body) {
                req.body = schemas.body.parse(req.body);
            }
            if (schemas.query) {
                Object.assign(req.query, schemas.query.parse(req.query));
            }
            if (schemas.params) {
                req.params = schemas.params.parse(req.params);
            }
        } catch (error) {
            if (error instanceof ZodError) {
                // Map zod errors into a friendly object
                // Build human-readable messages from Zod issues
                const issues = error.errors || error.issues || [];
                const friendlyMessages = issues.map(err => {
                    const field = err.path.join(".");
                    const label = field
                        .replace(/([A-Z])/g, " $1")       // camelCase → spaced
                        .replace(/^./, c => c.toUpperCase()) // capitalize first letter
                        .trim();

                    if (err.code === "too_small" && err.minimum === 1) return `${label} is required.`;
                    if (err.code === "invalid_type" && err.received === "undefined") return `${label} is required.`;
                    if (err.code === "invalid_enum_value") return `${label} has an invalid value.`;
                    return `${label}: ${err.message}`;
                });
                const summary = friendlyMessages.join(" ");
                return res.status(400).json({ success: false, message: summary });
            }
            return res.status(500).json({ success: false, message: "Internal validation error" });
        }

        // Call next outside try-catch so it doesn't catch downstream errors
        next();
    };
};
