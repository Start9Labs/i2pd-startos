# Updating the upstream version

i2pd is installed from the Alpine edge package repository and pinned in the `Dockerfile` via `ARG I2PD_VERSION` (an exact `apk` version like `2.60.0-r1`). The Alpine edge base image is additionally pinned by digest (`FROM alpine:edge@sha256:...`) so builds are reproducible. Bumping i2pd means updating both pins.

## Determining the upstream version

### i2pd (canonical upstream)

Canonical home: <https://github.com/PurpleI2P/i2pd>. Latest release tag:

```
gh release view -R PurpleI2P/i2pd --json tagName -q .tagName
```

Use this to know what the newest i2pd is so you can compare against what Alpine edge ships (next section). The pin in this repo tracks the Alpine package, not the GitHub tag.

### i2pd as packaged by Alpine edge (what actually ships)

The current pin lives in the `Dockerfile` at `ARG I2PD_VERSION`. To see the latest version Alpine edge carries:

```
docker pull alpine:edge
docker run --rm alpine:edge sh -c 'apk update -q && apk search -e i2pd'
```

(Or browse <https://pkgs.alpinelinux.org/packages?name=i2pd&branch=edge> directly.) The `apk` version string (`X.Y.Z-rN`) is what goes in `ARG I2PD_VERSION`.

### Alpine edge digest

Grab the manifest-list digest of the image you just pulled:

```
docker inspect alpine:edge --format '{{index .RepoDigests 0}}'
```

The pin lives in the `Dockerfile`'s `FROM` line.

## Applying the bump

1. Edit the `Dockerfile`: set `ARG I2PD_VERSION=<new apk version>` and update the `FROM alpine:edge@sha256:...` digest to the one that carries it.
2. Update `version` and `releaseNotes` in `startos/versions/current.ts` — the latest version always lives in that file, so an in-place edit is all most bumps need. A new file is spun off only when the bump requires a migration — see [Versions](https://docs.start9.com/packaging/versions.html).
3. Re-validate the log filter (below).
4. Rebuild.

## Re-validating the log filter

`startos/i2pdLogFilter.ts` drops known-benign `warn` lines whose text is transcribed verbatim from i2pd field exports. An upstream bump can reword any of them, which **fails open**: a reworded line stops matching, so nothing is hidden, but the flood it was suppressing comes back.

After the bump, run the router for a few hours at the default `warn` level and read the service log. If it is carrying repeating routine chatter again, capture the new wording, add or widen the family in `CHURN_FAMILIES`, and add the captured line to the `DROPPED` fixtures in `test/i2pdLogFilter.test.ts` — one real line per family, in `CHURN_FAMILIES` order. `npm run check` runs the suite.

Never widen a pattern past one complete message. A pattern loose enough to match a message nobody has seen hides evidence on the day it matters.
