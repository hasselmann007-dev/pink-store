// api/checkout.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Garante que temos um body como objeto
    let body = req.body;

    if (!body || typeof body !== "object") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      body = raw ? JSON.parse(raw) : {};
    }

    console.log("🛒 Body recebido em /api/checkout (TESTE):", body);

    const { cart, customer, paymentMethod, bumpAdded, shipping } = body;

    return res.status(200).json({
      ok: true,
      message: "Checkout TESTE funcionando",
      received: {
        cart,
        customer,
        paymentMethod,
        bumpAdded,
        shipping,
      },
    });
  } catch (err) {
    console.error("Erro no /api/checkout (TESTE):", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno no servidor (teste)",
    });
  }
}
