import { FetchState, sessions, actions, middleware, pages } from "astro/fetch";

const getPayloadApiBase = () => {
  const raw = (import.meta.env.PUBLIC_API_URL || "").replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
};

export default {
  async fetch(request: Request): Promise<Response> {
    const state = new FetchState(request);
    await sessions(state);

    const apiBase = getPayloadApiBase();
    // Grab the auth token explicitly sent from our React component
    const authHeader = state.request.headers.get("authorization") || "";

    if (state.pathname === "/api/comments") {
      
      // 1. GET: Fetch Comments
      if (state.request.method === "GET") {
        const postId = state.url.searchParams.get("postId");
        
        if (!postId || postId === "undefined") {
          return Response.json({ docs: [] });
        }

        try {
          const commentsRes = await fetch(
            `${apiBase}/comments?where[article][equals]=${encodeURIComponent(postId)}&depth=2&sort=-createdAt`
          );
          const commentsData = await commentsRes.json();
          return Response.json(commentsData);
        } catch (err) {
          return Response.json({ docs: [] }, { status: 500 });
        }
      }

      // 2. POST: Create Comment
      if (state.request.method === "POST") {
        try {
          const body = await state.request.json();
          
          // Forward request to Payload CMS WITH the Authorization header
          const payloadRes = await fetch(`${apiBase}/comments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authHeader && { Authorization: authHeader }) // Injects the token
            },
            body: JSON.stringify({
              article: body.article,
              user: body.userId, // Explicitly pass the user ID 
              content: body.content,
              parentComment: body.parentComment || null,
            }),
          });

          const data = await payloadRes.json();
          return Response.json(data, { status: payloadRes.status });
        } catch (err) {
          return Response.json({ error: "Failed to post comment" }, { status: 500 });
        }
      }

      // 3. PATCH: Votes
      if (state.request.method === "PATCH") {
        try {
          const body = await state.request.json();
          const { commentId, voteType, userId } = body;

          const getRes = await fetch(`${apiBase}/comments/${commentId}?depth=0`);
          if (!getRes.ok) return Response.json({ error: "Not found" }, { status: 404 });
          const comment = await getRes.json();

          let upvotes = Array.isArray(comment.upvotes) ? comment.upvotes.map((u: any) => typeof u === 'object' ? u.id : u) : [];
          let downvotes = Array.isArray(comment.downvotes) ? comment.downvotes.map((u: any) => typeof u === 'object' ? u.id : u) : [];
          
          if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

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

          const patchRes = await fetch(`${apiBase}/comments/${commentId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(authHeader && { Authorization: authHeader })
            },
            body: JSON.stringify({ upvotes, downvotes }),
          });

          const patchData = await patchRes.json();
          return Response.json(patchData, { status: patchRes.status });
        } catch (err) {
          return Response.json({ error: "Failed to process vote" }, { status: 500 });
        }
      }
    }

    const actionResponse = await actions(state);
    if (actionResponse) return actionResponse;

    return await middleware(state, (s) => pages(s));
  },
};
