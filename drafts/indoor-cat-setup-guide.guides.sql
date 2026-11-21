-- Registers the two printables for the indoor cat setup guide.
-- Upload both PNGs in Admin -> Media FIRST, note the number each one gets,
-- then substitute them for <CARE_MEDIA_ID> and <CHECKLIST_MEDIA_ID> below.
--
-- `file` is the key the post links to: /img/<file> for the thumbnail and
-- /download/<file> for the download. It must match the hrefs in the post body.
--
-- Note the admin re-encodes an upload to JPEG when that comes out smaller, so a
-- file registered as .png may be served as image/jpeg and save as .jpg. That is
-- expected -- public.js builds the download filename from the stored mime, not
-- from this key.

INSERT INTO guides (file, title, category, blurb, related, media_id, sort) VALUES
('indoor-cat-care-sheet.png',
 'Indoor Cat Quick Care Sheet',
 'Cats',
 'Every number from the setup guide on one page — litter box count and sizing, litter depth, vertical space, daily water by body weight, the signs of a healthy cat, and the five things that mean call a vet.',
 '/blog/indoor-cat-setup-guide',
 <CARE_MEDIA_ID>, 9);

INSERT INTO guides (file, title, category, blurb, related, media_id, sort) VALUES
('indoor-cat-setup-checklist.png',
 'Indoor Cat Setup Checklist',
 'Cats',
 'Everything in place before the carrier door opens — what to buy, how to set up the safe room, the first-week introduction plan day by day, and the six questions to ask the shelter.',
 '/blog/indoor-cat-setup-guide',
 <CHECKLIST_MEDIA_ID>, 10);
