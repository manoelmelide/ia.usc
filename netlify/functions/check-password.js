// netlify/functions/check-password.js
exports.handler = async (event) => {
  const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;
  const { password } = JSON.parse(event.body);
  if (password === ACCESS_PASSWORD) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }
  return { statusCode: 401, body: JSON.stringify({ ok: false }) };
}
