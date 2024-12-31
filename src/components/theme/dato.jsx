const people = [
  {
    id: 0,
    name: "Creola Katherine Johnson",
    profession: "matemática",
  },
  {
    id: 1,
    name: "Mario José Molina-Pasquel Henríquez",
    profession: "químico",
  },
  {
    id: 2,
    name: "Mohammad Abdus Salam",
    profession: "físico",
  },
  {
    id: 3,
    name: "Percy Lavon Julian",
    profession: "químico",
  },
  {
    id: 4,
    name: "Subrahmanyan Chandrasekhar",
    profession: "astrofísico",
  },
];


<Card
  variant="outlined"
  sx={{  p: 2,
    width: { xs: '100%', sm: 'auto' },
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: 'center',
    gap: 2,
  }}
>
  <CardMedia
    component="img"
    width="100"
    height="100"
    alt="Contemplative Reptile album cover"
    src="/images/contemplative-reptile.jpg"
    sx={{    width: { xs: '100%', sm: 100 },
    }}
  />
  <Stack direction="column" alignItems="center" spacing={1} useFlexGap>
    <div>
      <Typography color="text.primary" fontWeight="semiBold">
        Contemplative Reptile
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight="medium"
        textAlign="center"
        sx={{ width: '100%' }}
      >
        Sounds of Nature
      </Typography>
    </div>
    <Stack direction="row" alignItems="center" spacing={1} useFlexGap>
      <IconButton aria-label="Shuffle" disabled size="small">
        <ShuffleRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton aria-label="Fast rewind" disabled size="small">
        <FastRewindRounded fontSize="small" />
      </IconButton>
      <IconButton
        aria-label={paused ? 'Play music' : 'Pause music'}
        onClick={() => setPaused((val) => !val)}
        sx={{ mx: 1 }}
      >
        {paused ? <PlayArrowRounded /> : <PauseRounded />}
      </IconButton>
      <IconButton aria-label="Fast forward" disabled size="small">
        <FastForwardRounded fontSize="small" />
      </IconButton>
      <IconButton aria-label="Loop music" disabled size="small">
        <LoopRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  </Stack>
</Card>