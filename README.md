# Storage-v2

> Das Projekt ist derzeit noch in arbeit, weshalb es noch einige Sicherheitslücken in der Anwendung und im Backend gibt. Vor einer Produktiven Nutzung wird derzeit noch abgeraten!

## :rocket: Features

<details>
  <summary>✅ Dateien</summary>
  Daten mittels Knopfdruck oder Drag-'n-Drop hochladen und später wieder herunterladen, mit privaten Links teilen oder umbennen.
  (Demnächst können auch gleichzeitig mehrere Dateien hochgeladen werden)
</details>

<details>
  <summary>❌ Ordner</summary>
  Man kann als Benutzer Ordner erstellen, hochladen, herunterladen und Dateien darin verschieben und diese umbennen.
</details>

## Setup

1. Create an supabase project
   _(Optional): You can host your own Supabase instance using Docker._

2. Set [bucket policies](#storage-policies)

   ```txt
   .
   {{userID}}
   └───{{content}}
   {{userID}}
   └───{{content}}
   {{userID}}
   └───{{content}}
   {{userID}}
   └───{{content}}
   {{userID}}
   └───{{content}}
   {{userID}}
   └───{{content}}
   ```

3. Create [required RPCs](#required-rpcs)

4. Create an `.env`-file

   ```txt
   REACT_APP_SUPABASE_URL=
   REACT_APP_SUPABASE_ANON_KEY=
   REACT_APP_PUBLIC_BUCKETS=<true|false>
   ```

5. Run your application

   ```shell
   npm start
   ```

### Storage Policies

#### Any authentificated user can create an bucket

```sql
CREATE POLICY "Any authentificated user can create an bucket" ON "storage"."buckets"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true)
```

#### Any owner can retrieve his bucket details

```sql
CREATE POLICY "Any owner can retrieve his bucket details" ON "storage"."buckets"
AS PERMISSIVE FOR SELECT
TO authenticated
USING ((uid() = owner))
```

#### An authentificated owner can upload and manage his files

```sql
CREATE POLICY "An authentificated owner can upload and manage his files" ON "storage"."objects"
AS PERMISSIVE FOR ALL
TO authenticated
USING ((((uid())::text = bucket_id) OR (uid() = owner)))
WITH CHECK ((((uid())::text = bucket_id) OR (uid() = owner)))
```

### Required RPCs

#### `search(keyword string)`

> Since we have RLS policy enabled for `storage.objects`, only rows matching the rule will be returned!

```sql
CREATE OR REPLACE FUNCTION search(
    keyword varchar,
    limit_by integer default 100)
  RETURNS TABLE(id uuid,
    bucket_id text,
    name text,
    type text,
    owner text,
    metadata jsonb,
    path text,
    created_at timestamptz,
    updated_at timestamptz,
    last_accessed_at timestamptz)
AS $$
  SELECT
    *
  FROM
    prepared_storage_objects
  WHERE
    name != ''
  AND
    path != ''
  AND
    LOWER(name) LIKE ('%' || LOWER(keyword) || '%')
  ORDER BY type ASC
  LIMIT limit_by;
$$ language sql;
```

> Besides that this view is required for the function to run properly.

```sql
CREATE OR REPLACE
  VIEW prepared_storage_objects
  AS SELECT
    id,
    bucket_id,
    CASE
      WHEN (metadata->'mimetype' = '"application/octet-stream"' AND metadata->'size' = '0')
        THEN TRIM(TRAILING '/' FROM RTRIM(name, '.emptyFolderPlaceholder'))
      ELSE SPLIT_PART(name, '/', -1)
    END AS name,
    CASE
      WHEN (metadata->'mimetype' = '"application/octet-stream"' AND metadata->'size' = '0') THEN 'FOLDER'
      ELSE 'FILE'
    END AS type,
    COALESCE(owner::text, bucket_id::text) as owner,
    metadata,
    RTRIM(array_to_string(path_tokens, '/'), '.emptyFolderPlaceholder') as path,
    created_at,
    updated_at,
    last_accessed_at
  FROM
    storage.objects
  ORDER BY
    updated_at DESC;
```
