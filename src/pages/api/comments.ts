import type { APIRoute } from 'astro';

const getPayloadApiBase = () => {
  const raw = (import.meta.env.PUBLIC_API_URL || "").replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
};

// --- GET: Fetch Comments ---
export const GET: APIRoute = async ({ request, url }) => {
  const postId = url.searchParams.get("postId");
  
  if (!postId || postId === "undefined") {
    return new Response(JSON.stringify({ docs: [] }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  const apiBase = getPayloadApiBase();
  try {
    const res = await fetch(
      `${apiBase}/comments?where[article][equals]=${encodeURIComponent(postId)}&depth=2&sort=-createdAt`
    );
    const data = await res.json();
    return new Response(JSON.stringify(data), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ docs: [] }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};

// --- POST: Create Comment or Reply ---
export const POST: APIRoute = async ({ request }) => {
  const apiBase = getPayloadApiBase();
  const authHeader = request.headers.get("authorization") || "";

  try {
    const body = await request.json();
    
    const payloadRes = await fetch(`${apiBase}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify({
        article: body.article,
        user: body.userId,
        content: body.content,
        parentComment: body.parentComment || null,
      }),
    });

    const data = await payloadRes.json();
    return new Response(JSON.stringify(data), { 
      status: payloadRes.status, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to post comment" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};

// --- PATCH: Handle Upvotes & Downvotes ---
export const PATCH: APIRoute = async ({ request }) => {
  const apiBase = getPayloadApiBase();
  const authHeader = request.headers.get("authorization") || "";

  try {
    const body = await request.json();
    const { commentId, voteType, userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 1. Fetch current comment state
    const getRes = await fetch(`${apiBase}/comments/${commentId}?depth=0`);
    if (!getRes.ok) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }
    const comment = await getRes.json();

    let upvotes = Array.isArray(comment.upvotes) ? comment.upvotes.map((u: any) => typeof u === 'object' ? u.id : u) : [];
    let downvotes = Array.isArray(comment.downvotes) ? comment.downvotes.map((u: any) => typeof u === 'object' ? u.id : u) : [];
    
    // 2. Toggle logic
    if (voteType === 'upvote') {
      if (upvotes.includes(userId)) {
        upvotes = upvotes.filter((id: number) => id !== userId);
      } else {
        upvotes.push(userId);
        downvotes = downvotes.filter((id: number) => id !== userId);
      }
    } else if (voteType === 'downvote') {
      if (downvotes.includes(userId)) {
        downvotes = downvotes.filter((id: number) => id !== userId);
      } else {
        downvotes.push(userId);
        upvotes = upvotes.filter((id: number) => id !== userId);
      }
    }

    // 3. Send update to Payload CMS
    const patchRes = await fetch(`${apiBase}/comments/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify({ upvotes, downvotes }),
    });

    const patchData = await patchRes.json();
    return new Response(JSON.stringify(patchData), { 
      status: patchRes.status, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to process vote" }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};

// --- DELETE: Remove Comment ---
export const DELETE: APIRoute = async ({ request, url }) => {
  const apiBase = getPayloadApiBase();
  const authHeader = request.headers.get("authorization") || "";
  
  const commentId = url.searchParams.get("commentId");
  const userId = url.searchParams.get("userId"); // <-- Grab the userId

  try {
    if (!commentId) {
      return new Response(JSON.stringify({ error: "Missing comment ID" }), { 
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    // Append userId to the Payload URL so the access rule can see it
    const payloadUrl = userId 
      ? `${apiBase}/comments/${commentId}?userId=${userId}` 
      : `${apiBase}/comments/${commentId}`;

    const payloadRes = await fetch(payloadUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader })
      }
    });

    if (payloadRes.status === 204) return new Response(null, { status: 204 });

    const rawText = await payloadRes.text();
    let data = {};
    if (rawText) {
      try { data = JSON.parse(rawText); } catch(e) {}
    }

    return new Response(JSON.stringify(data), { 
      status: payloadRes.status, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to delete comment" }), { 
      status: 500, headers: { "Content-Type": "application/json" } 
    });
  }
};
