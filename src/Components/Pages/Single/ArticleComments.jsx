import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { $user, isUserLoggedIn } from '../../../store/userStore'; 
import './ArticleComments.css';

const normalizeId = (id) => {
  if (id === null || id === undefined || id === '') return id;
  const num = Number(id);
  return !Number.isNaN(num) ? num : id;
};

// Extracts the real user profile picture (like the Google OAuth URL)
const getUserAvatarUrl = (userObj) => {
  if (!userObj) return null;
  if (typeof userObj.avatar === 'string') return userObj.avatar;
  if (userObj.avatar?.url) return userObj.avatar.url;
  if (typeof userObj.profilePicture === 'string') return userObj.profilePicture;
  if (userObj.profilePicture?.url) return userObj.profilePicture.url;
  if (typeof userObj.image === 'string') return userObj.image;
  if (userObj.image?.url) return userObj.image.url;
  if (typeof userObj.avatarUrl === 'string') return userObj.avatarUrl;
  return null;
};

const CommentItem = ({ comment, activeUser, onVote, onReply, onDelete }) => {
  const [showFullText, setShowFullText] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const avatarUrl = comment.user.avatar;
  const isUpvotedByMe = activeUser && comment.upvotedUsers?.includes(normalizeId(activeUser.id));
  const isDownvotedByMe = activeUser && comment.downvotedUsers?.includes(normalizeId(activeUser.id));
  const isMyComment = activeUser && normalizeId(activeUser.id) === normalizeId(comment.user.id);

  // The specific fallback icon you requested
  const fallbackAvatar = "https://img.icons8.com/cute-clipart/64/gender-neutral-user.png";

  const MAX_CHARS = 120;
  const isLongText = comment.text.length > MAX_CHARS;
  const displayText = isLongText && !showFullText ? `${comment.text.slice(0, MAX_CHARS)}...` : comment.text;

  return (
    <div className="neo-comment-item">
      <div className="neo-comment-avatar-wrap">
        {/* Prioritizes the real avatar, forces the fallback if missing or broken */}
        <img 
          src={avatarUrl || fallbackAvatar} 
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
          alt={comment.user.name} 
          className="neo-comment-avatar-img" 
        />
      </div>

      <div className="neo-comment-body">
        <div className="neo-comment-name-row">
          <div className="neo-comment-name-wrap">
            <span className="neo-comment-name">{comment.user.name}</span>
            {isMyComment && <span className="neo-comment-you">(you)</span>}
            {comment.badge && <span className="neo-comment-badge">{comment.badge}</span>}
          </div>
          
          {isMyComment && (
            <div className="neo-comment-header-right">
              <button 
                className="neo-comment-delete-btn" 
                onClick={() => onDelete(comment.id)}
                title="Delete Comment"
              >
                <img width="24" height="24" src="https://img.icons8.com/plasticine/100/filled-trash.png" alt="filled-trash"/>
              </button>
            </div>
          )}
        </div>
        
        <div className="neo-comment-time">{comment.time}</div>
        
        <div className="neo-comment-text">
          {displayText} 
          {isLongText && !showFullText && (
            <span className="neo-read-more" onClick={() => setShowFullText(true)}> Read More</span>
          )}
        </div>
        
        <div className="neo-comment-footer">
          <span className="neo-comment-replies">
            {comment.replies?.length || 0} Replies
          </span>
          <div className="neo-comment-actions">
            <div className="neo-comment-vote-group">
              <button 
                className={`neo-comment-vote ${isUpvotedByMe ? 'active-upvote' : ''}`}
                onClick={() => onVote(comment.id, 'upvote')}
              >
                <svg viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                {comment.upvotes}
              </button>
              <button 
                className={`neo-comment-vote ${isDownvotedByMe ? 'active-downvote' : ''}`}
                onClick={() => onVote(comment.id, 'downvote')}
              >
                <svg viewBox="0 0 24 24" style={{transform: 'rotate(180deg)'}}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                {comment.downvotes}
              </button>
            </div>
            <button 
              className="neo-comment-reply-btn" 
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
          </div>
        </div>

        {isReplying && (
          <div className="neo-comment-input-area" style={{ marginTop: '16px' }}>
            <textarea 
              placeholder={`Replying to ${comment.user.name}...`} 
              value={replyText} 
              onChange={(e) => setReplyText(e.target.value)} 
              rows={2}
              autoFocus
            />
            <div className="neo-comment-input-actions">
              <button className="neo-btn-cancel" onClick={() => { setIsReplying(false); setReplyText(""); }}>Cancel</button>
              <button className="neo-btn-post" onClick={() => { onReply(comment.id, replyText); setIsReplying(false); setReplyText(""); }}>Post Reply</button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="neo-comment-replies-list" style={{ marginTop: '16px', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
            {comment.replies.map(reply => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                activeUser={activeUser} 
                onVote={onVote} 
                onReply={onReply} 
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ArticleComments = ({ postId }) => {
  const activeUser = useStore($user);

  const [expanded, setExpanded] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const textareaRef = useRef(null);

  useEffect(() => {
    let isScrolling;
    const handleScroll = () => {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
        if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') {
          document.activeElement.blur();
        }
      }, 66); 
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchComments = async () => {
    if (!postId) return;

    try {
      const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
      const data = await res.json();

      if (isUserLoggedIn(data?.user) && !isUserLoggedIn(activeUser)) {
        $user.set(data.user);
      }

      if (data?.docs) {
        const formatCommentDoc = (doc) => {
          const userName = doc.user?.name || doc.user?.email || "User";
          const repliesList = (doc.replies?.docs || doc.replies || []).map(formatCommentDoc);

          return {
            id: doc.id,
            user: {
              id: doc.user?.id || doc.user,
              name: userName,
              initial: userName[0].toUpperCase(),
              avatar: getUserAvatarUrl(doc.user),
              color: "#2D89C8"
            },
            badge: doc.user?.role === 'admin' ? 'Author' : null,
            time: new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            text: doc.content,
            upvotes: Array.isArray(doc.upvotes) ? doc.upvotes.length : (doc.upvotes || 0),
            downvotes: Array.isArray(doc.downvotes) ? doc.downvotes.length : (doc.downvotes || 0),
            upvotedUsers: Array.isArray(doc.upvotes) ? doc.upvotes.map(u => typeof u === 'object' ? u.id : u) : [],
            downvotedUsers: Array.isArray(doc.downvotes) ? doc.downvotes.map(u => typeof u === 'object' ? u.id : u) : [],
            repliesCount: repliesList.length,
            replies: repliesList,
            parentComment: doc.parentComment?.id || doc.parentComment || null
          };
        };

        const topLevelDocs = data.docs.filter(d => !d.parentComment);
        setComments(topLevelDocs.map(formatCommentDoc));
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const displayComments = expanded ? comments : comments.slice(0, 1);
  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  const handleShareClick = () => {
    if (!isUserLoggedIn(activeUser)) {
      window.dispatchEvent(new CustomEvent('neo-open-login'));
      return;
    }
    setIsWriting(true);
    setTimeout(() => { if (textareaRef.current) textareaRef.current.focus(); }, 100);
  };

  const handlePostComment = async () => {
    if (isSubmitting) return;
    if (!isUserLoggedIn(activeUser)) {
      window.dispatchEvent(new CustomEvent('neo-open-login'));
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('payload-token');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `JWT ${token}` })
        },
        body: JSON.stringify({
          article: normalizeId(postId),
          userId: normalizeId(activeUser.id),
          content: commentText.trim(),
        }),
      });

      if (res.status === 401 || res.status === 403) {
        $user.set(null); 
        window.dispatchEvent(new CustomEvent('neo-open-login'));
        setIsSubmitting(false);
        return;
      }

      if (res.ok) {
        setCommentText("");
        setIsWriting(false);
        setExpanded(true);
        await fetchComments();
      }
    } catch (error) {
      console.error("Network error while posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostReply = async (parentId, text) => {
    if (!isUserLoggedIn(activeUser)) {
      window.dispatchEvent(new CustomEvent('neo-open-login'));
      return;
    }
    if (!text.trim()) return;
    
    const token = localStorage.getItem('payload-token');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `JWT ${token}` })
        },
        body: JSON.stringify({
          article: normalizeId(postId),
          userId: normalizeId(activeUser.id),
          content: text.trim(),
          parentComment: normalizeId(parentId),
        }),
      });

      if (res.ok) {
        await fetchComments();
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  const handleVote = async (commentId, type) => {
    if (!isUserLoggedIn(activeUser)) {
      window.dispatchEvent(new CustomEvent('neo-open-login'));
      return;
    }
    
    const myId = normalizeId(activeUser.id);

    setComments(prevComments => {
      const updateTree = (nodes) => {
        return nodes.map(node => {
          if (node.id === commentId) {
            let upList = [...node.upvotedUsers];
            let downList = [...node.downvotedUsers];

            if (type === 'upvote') {
              if (upList.includes(myId)) {
                upList = upList.filter(id => id !== myId);
              } else {
                upList.push(myId);
                downList = downList.filter(id => id !== myId);
              }
            } else if (type === 'downvote') {
              if (downList.includes(myId)) {
                downList = downList.filter(id => id !== myId);
              } else {
                downList.push(myId);
                upList = upList.filter(id => id !== myId);
              }
            }

            return {
              ...node,
              upvotedUsers: upList,
              downvotedUsers: downList,
              upvotes: upList.length,
              downvotes: downList.length
            };
          }
          if (node.replies) {
            return { ...node, replies: updateTree(node.replies) };
          }
          return node;
        });
      };
      return updateTree(prevComments);
    });

    const token = localStorage.getItem('payload-token');
    try {
      await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `JWT ${token}` })
        },
        body: JSON.stringify({
          commentId: normalizeId(commentId),
          voteType: type,
          userId: myId
        }),
      });
      fetchComments();
    } catch (err) {
      console.error("Failed to cast vote:", err);
      fetchComments(); 
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isUserLoggedIn(activeUser)) return;
    
    const token = localStorage.getItem('payload-token');

    try {
      const res = await fetch(`/api/comments?commentId=${normalizeId(commentId)}&userId=${normalizeId(activeUser.id)}`, {
        method: 'DELETE',
        headers: { 
          ...(token && { Authorization: `JWT ${token}` })
        }
      });

      if (res.ok) {
        await fetchComments(); 
      } else {
        console.error("Deletion rejected by server.");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="neo-comments-section">
      <h3 
        className="neo-comments-header" 
        onClick={() => totalComments > 1 && setExpanded(!expanded)}
        style={{ cursor: totalComments > 1 ? 'pointer' : 'default' }}
      >
        Comments ({totalComments}) {totalComments > 1 && <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>}
      </h3>

      {totalComments === 0 ? (
        <div className="neo-no-comments">There are currently no comments. Be the first to share your insights.</div>
      ) : (
        <div className="neo-comments-list">
          {displayComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              activeUser={activeUser} 
              onVote={handleVote} 
              onReply={handlePostReply} 
              onDelete={handleDeleteComment} 
            />
          ))}
        </div>
      )}

      {isWriting && (
        <div className="neo-comment-input-area">
          <textarea 
            ref={textareaRef}
            placeholder="What are your thoughts?" 
            value={commentText} 
            onChange={(e) => setCommentText(e.target.value)} 
            rows={3}
          />
          <div className="neo-comment-input-actions">
            <button className="neo-btn-cancel" onClick={() => setIsWriting(false)}>Cancel</button>
            <button 
              className="neo-btn-post" 
              onClick={handlePostComment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      )}

      {!isWriting && (
        <div className="neo-comments-buttons">
          <button className="neo-btn-share" onClick={handleShareClick}>Share Your Opinion</button>
          
          {totalComments > 1 && !expanded && (
            <button className="neo-btn-see-all" onClick={() => setExpanded(true)}>See All Comments</button>
          )}
          {totalComments > 1 && expanded && (
            <button className="neo-btn-see-all" onClick={() => setExpanded(false)}>Hide Comments</button>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleComments;
