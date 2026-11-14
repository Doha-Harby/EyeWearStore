/** Every success response has the same shape: { success: true, message?, data, meta? } */
export function sendSuccess(res, data = null, { status = 200, message, meta } = {}) {
  return res
    .status(status)
    .json({ success: true, ...(message && { message }), data, ...(meta && { meta }) });
}
