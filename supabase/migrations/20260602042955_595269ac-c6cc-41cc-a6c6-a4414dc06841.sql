CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  brand_name text;
BEGIN
  brand_name := nullif(trim(coalesce(new.raw_user_meta_data->>'brand_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'My Brand')), '');

  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'brand_name')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  SELECT cm.company_id INTO new_company_id
  FROM public.company_members cm
  WHERE cm.user_id = new.id
  ORDER BY cm.created_at ASC
  LIMIT 1;

  IF new_company_id IS NULL THEN
    INSERT INTO public.companies (owner_id, name, industry, employee_size, website_url)
    VALUES (
      new.id,
      coalesce(brand_name, 'My Brand'),
      nullif(trim(new.raw_user_meta_data->>'industry'), ''),
      nullif(trim(new.raw_user_meta_data->>'employee_size'), ''),
      nullif(trim(new.raw_user_meta_data->>'website_url'), '')
    )
    RETURNING id INTO new_company_id;

    INSERT INTO public.company_members (company_id, user_id, role)
    VALUES (new_company_id, new.id, 'owner')
    ON CONFLICT (company_id, user_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;