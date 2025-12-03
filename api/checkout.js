// api/checkout.js

// -------------------------
// Configurações GhostsPay
// -------------------------
const GHOSTS_SECRET_KEY = process.env.GHOSTS_SECRET_KEY;
const GHOSTS_COMPANY_ID = process.env.GHOSTS_COMPANY_ID;
const GHOSTS_POSTBACK_URL =
  process.env.GHOSTS_POSTBACK_URL ||
  `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/ghostspay/webhook`;

const GHOSTS_BASE_URL =
  process.env.GHOSTS_BASE_URL ||
  "https://api.ghostspaysv2.com/functions/v1";

if (!GHOSTS_SECRET_KEY || !GHOSTS_COMPANY_ID) {
  console.warn(
    "⚠️ Atenção: GHOSTS_SECRET_KEY ou GHOSTS_COMPANY_ID não configurados nas variáveis de ambiente da Vercel."
  );
}

// -------------------------
// Handler Vercel: /api/checkout
// -------------------------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart, customer, shipping, paymentMethod, bumpAdded } = req.body;

    console.log("🛒 Payload recebido no /api/checkout:");
    console.log(JSON.stringify(req.body, null, 2));

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Carrinho vazio ou inválido",
      });
    }

    // calcula subtotal
    const subtotal = cart.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.qty || 1),
      0
    );

    // mesma regra do frontend: FRETE GRÁTIS acima de 199,90
    const SHIPPING_THRESHOLD = 199.9;
    const BASE_SHIPPING = 14.9;

    const shippingValue =
      subtotal > SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING;

    // mesmo valor do bump que você usa no frontend
    const ORDER_BUMP_PRICE = 9.9;
    const bumpValue = bumpAdded ? Number(ORDER_BUMP_PRICE) : 0;

    const total = subtotal + shippingValue + bumpValue;
    const amountInCents = Math.round(total * 100);

    console.log("🧾 Resumo do checkout:");
    console.log(`- Subtotal: ${subtotal}`);
    console.log(`- Frete: ${shippingValue}`);
    console.log(`- Bump: ${bumpValue}`);
    console.log(`- Total: ${total}`);
    console.log(`- amountInCents: ${amountInCents}`);

    // monta payload GhostsPay (igual ao server.js local)
    const ghostsPayload = {
      amount: amountInCents,
      description: "Compra na Pink Store",
      paymentMethod: "PIX",
      installments: 1,
      postbackUrl: GHOSTS_POSTBACK_URL,
      companyId: GHOSTS_COMPANY_ID,
      customer: {
        name: customer?.name || "Cliente",
        email:
          customer?.email || "cliente@email.com",
      },
      items: cart.map((item) => ({
        title: item.name,
        unitPrice: Math.round(Number(item.price) * 100),
        quantity: item.qty || 1,
        externalRef: item.productId || item.id,
      })),
      metadata: {
        bumpAdded: !!bumpAdded,
        source: "pink-store-frontend",
      },
    };

    console.log(
      "➡️ Enviando para GhostsPay:",
      JSON.stringify(ghostsPayload, null, 2)
    );

    const authToken = Buffer.from(
      `${GHOSTS_SECRET_KEY}:${GHOSTS_COMPANY_ID}`
    ).toString("base64");

    const response = await fetch(`${GHOSTS_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify(ghostsPayload),
    });

    const rawText = await response.text();
    let ghostData;

    try {
      ghostData = JSON.parse(rawText);
    } catch {
      console.error("GhostsPay retornou algo que não é JSON:", rawText);
      ghostData = { raw: rawText };
    }

    console.log(
      "⬅️ Resposta GhostsPay (status",
      response.status,
      "):",
      ghostData
    );

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error:
          ghostData.message ||
          ghostData.error ||
          ghostData.raw ||
          "Falha ao criar pagamento na GhostsPay",
        gatewayStatus: response.status,
        gatewayResponse: ghostData,
      });
    }

    return res.json({
      ok: true,
      payment: ghostData,
      gatewayStatus: response.status,
      pix: {
        qrcode: ghostData.pix?.qrcode || null,
        expirationDate: ghostData.pix?.expirationDate || null,
        amount: ghostData.amount || amountInCents,
      },
      status: ghostData.status,
    });
  } catch (err) {
    console.error("Erro no /api/checkout:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno no servidor",
    });
  }
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart, customer, paymentMethod, bumpAdded } = req.body;
    // 👉 aqui entra a lógica que hoje está no app.post("/api/checkout")

    return res.status(200).json({
      success: true,
      message: "Checkout criado com sucesso (serverless)",
    });
  } catch (error) {
    console.error("Erro no /api/checkout:", error);
    return res.status(500).json({ success: false, message: "Erro no checkout" });
  }
}
