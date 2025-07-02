// netlify/functions/check-password.js
exports.handler = async (event) => {
  let password;

  if (event.httpMethod === 'GET') {
    password = event.queryStringParameters?.password;
    if (!password) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Añade ?password=tuClave para probar en GET' })
      };
    }
  } else if (event.httpMethod === 'POST') {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Cuerpo vacío' }) };
    }
    try {
      ({ password } = JSON.parse(event.body));
    } catch {
      return { statusCode: 400, body: JSON.stringify({ message: 'JSON inválido' }) };
    }
  } else {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const SECRET = process.env.ACCESS_PASSWORD;
  if (password === SECRET) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }
  return { statusCode: 401, body: JSON.stringify({ ok: false }) };
};
