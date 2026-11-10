import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { supabase } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { deleteUploadInput, signInput } from '../../shared/schemas.js';

const router = Router();

router.post('/sign', validate(signInput), async (req, res, next) => {
  try {
    const { bucket, folder, contentType } = req.body;
    const ext = contentType.split('/')[1];
    const path = `${folder}/${randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
    if (error) throw error;
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    res.json({ data: { path, token: data.token, publicUrl } });
  } catch (e) { next(e); }
});

router.delete('/', validate(deleteUploadInput), async (req, res, next) => {
  try {
    const { error } = await supabase.storage.from(req.body.bucket).remove([req.body.path]);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
