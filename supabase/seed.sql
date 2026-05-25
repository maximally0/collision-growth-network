-- Seed data for Maximally Growth Network
-- Run this AFTER creating your first admin user via the signup flow
-- Then update that user's role to 'admin' manually:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your-admin@email.com';

-- Sample Narrative
insert into public.narratives (monthly_theme, weekly_theme, daily_angle, start_date, end_date, active)
values (
  'Students should build instead of waiting',
  'Why young builders move faster than traditional paths',
  'Your first startup teaches more than most classrooms ever will',
  current_date,
  current_date + interval '30 days',
  true
);

-- Sample Engagement Tasks
insert into public.engagement_tasks (title, post_url, creator_name, summary, action_required, suggested_angles, priority, expires_at, created_by)
values
(
  'Collision Conference Recap',
  'https://linkedin.com/posts/example-1',
  'Sarah Chen',
  'Great post about the energy at Collision and why student founders need more spaces like this.',
  'comment',
  ARRAY['Talk about how student founders need spaces like Collision', 'Share your own conference experience', 'Mention how events accelerate network building'],
  'high',
  now() + interval '3 days',
  null
),
(
  'Building in Public Thread',
  'https://linkedin.com/posts/example-2',
  'Alex Rivera',
  'Thread about the power of building in public as a student. Resonates with our narrative.',
  'repost',
  ARRAY['Add your take on transparency in building', 'Connect it to the Maximally mission', 'Share a personal building-in-public moment'],
  'medium',
  now() + interval '5 days',
  null
),
(
  'Why I Dropped My MBA Plans',
  'https://linkedin.com/posts/example-3',
  'Jordan Park',
  'Controversial take on traditional education vs startup experience. High engagement potential.',
  'comment',
  ARRAY['Share your own education vs building perspective', 'Be thoughtful not dismissive of education', 'Tie it to learning by doing philosophy'],
  'urgent',
  now() + interval '2 days',
  null
);

-- Sample People Tasks
insert into public.people_tasks (profile_url, name, role_title, niche_tags, why_they_matter, suggested_action, connection_note, expires_at, created_by)
values
(
  'https://linkedin.com/in/example-founder',
  'Maya Johnson',
  'Founder @ BuildFast',
  ARRAY['ai founder', 'student builder', 'YC alum'],
  'Active in the student founder space. High engagement on her posts. Potential collaboration partner.',
  'connect',
  'Hey Maya! Love what you''re building at BuildFast. I''m part of the Maximally community — would love to connect and share notes on student founder growth.',
  now() + interval '7 days',
  null
),
(
  'https://linkedin.com/in/example-creator',
  'David Kim',
  'Content Creator & Startup Operator',
  ARRAY['content creator', 'startup operator', 'growth'],
  'Creates viral LinkedIn content about startup culture. Engaging with him boosts visibility.',
  'comment',
  'Your posts on startup culture always hit different. Would love to chat about how you think about content strategy.',
  now() + interval '5 days',
  null
),
(
  'https://linkedin.com/in/example-investor',
  'Rachel Torres',
  'Partner @ NextGen Ventures',
  ARRAY['investor', 'student startups', 'early stage'],
  'Invests in student-led startups. Building relationship early is strategic.',
  'follow',
  'Hi Rachel — following your work at NextGen. We''re building a community of student founders at Maximally and your thesis resonates deeply.',
  now() + interval '10 days',
  null
);

-- Sample Post Briefs
insert into public.post_briefs (title, objective, core_idea, structure, emotional_direction, references, deadline, narrative_id, created_by)
values
(
  'The Classroom vs The Arena',
  'authority',
  'Most students are over-preparing and under-building. The real education happens when you ship.',
  'Hook: Bold claim about education\nPersonal observation (2-3 lines)\nInsight: What building taught you that school didn''t\nMini story: A specific moment\nPunchline: The reframe\nCTA: Ask your audience what they learned by doing',
  'thoughtful',
  ARRAY['https://linkedin.com/posts/reference-1'],
  now() + interval '2 days',
  (select id from public.narratives where active = true limit 1),
  null
),
(
  'My First 100 Days Building',
  'relatability',
  'Nobody talks about how messy the first 100 days of building actually are. Here''s what mine looked like.',
  'Hook: Vulnerability opener\nTimeline format (day 1, day 30, day 60, day 100)\nEach milestone: one honest sentence\nEnding: What you''d tell yourself on day 1\nCTA: Share your day 1 moment',
  'reflective',
  ARRAY['https://linkedin.com/posts/reference-2'],
  now() + interval '3 days',
  (select id from public.narratives where active = true limit 1),
  null
);
