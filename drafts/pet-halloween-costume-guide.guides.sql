-- Registers the two printables for the pet Halloween costume guide.
-- Upload both PNGs in Admin -> Media FIRST, note the number each one gets,
-- then substitute them for <FIT_MEDIA_ID> and <NIGHT_MEDIA_ID> below.

INSERT INTO guides (file, title, category, blurb, related, media_id, sort) VALUES
('pet-costume-fit-sheet.png',
 'Pet Costume Fit & Safety Sheet',
 'Dogs',
 'Where to put the tape measure, the two-finger fit test, the four things a costume must never cover, the distress signals that mean take it off, and which species should not wear one at all.',
 '/blog/pet-halloween-costume-guide',
 <FIT_MEDIA_ID>, 11);

INSERT INTO guides (file, title, category, blurb, related, media_id, sort) VALUES
('halloween-pet-safety-checklist.png',
 'Halloween Night Pet Safety Checklist',
 'Dogs',
 'Everything to do before the first knock — where the pet goes, where the candy goes, the decorations to move, and the poison-control numbers to write down while you are calm.',
 '/blog/pet-halloween-costume-guide',
 <NIGHT_MEDIA_ID>, 12);
