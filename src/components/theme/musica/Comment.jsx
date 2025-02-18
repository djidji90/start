const Comment = ({ comment, onLike, onDislike }) => (
  <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
    <Avatar src={comment.user?.profile_picture} />
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="subtitle2" fontWeight="bold">
        {comment.user?.username}
      </Typography>
      <Typography variant="body2">{comment.content}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <IconButton size="small" onClick={() => onLike(comment.id)}>
          <Favorite fontSize="small" color={comment.user_liked ? 'error' : 'inherit'} />
        </IconButton>
        <Typography variant="caption">{comment.likes}</Typography>
        
        <IconButton size="small" onClick={() => onDislike(comment.id)}>
          <ThumbDown fontSize="small" color={comment.user_disliked ? 'error' : 'inherit'} />
        </IconButton>
        <Typography variant="caption">{comment.dislikes}</Typography>
      </Box>
    </Box>
  </Box>
);