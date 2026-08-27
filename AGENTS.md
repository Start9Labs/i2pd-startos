# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Never delete a tunnel key without meaning to.** A `.b32.i2p` address is `base32(SHA256(destination))` of the key material, so a lost key is a permanently lost address. The plugin's cleanup prunes **only** on a confirmed-gone host — `sdk.host.get` returning `null`. A _thrown_ lookup keeps the entry and its key, because an unresolvable legacy entry is not evidence the host is gone.
- **`i2pd.conf` and `tunnels.conf` are generated, and re-emitted on every init.** That is what lets a package upgrade ship generator changes; don't turn either into a file model, and don't expect a hand edit to survive.
- **SAM is bound with no exported interface, deliberately.** It is unauthenticated, so it must stay reachable over the bridge only — never on LAN, clearnet or Tor.
- **The SSU2 and NTCP2 ports are exported so they can be forwarded.** Without a consistent external mapping i2pd reports "Firewalled - Symmetric NAT" and inbound tunnel delivery fails, which breaks every server tunnel this package issues.
- **The tunnel actions are `visibility: 'hidden'` on purpose.** They are the URL plugin's table action, reached from another service's interface settings; surfacing them here would invite creating orphan tunnels.
- **`samHostId`, `samPort`, `socksHostId` and `socksPort` in `startos/utils.ts` are a published contract.** Dependent packages import them by that module path; nothing else in this repo does, so renaming one — including tidying the `-multi` off a host id — breaks dependents with no signal here, and `MultiHost.retire()` (the way to release the stranded port) is not in the pinned SDK.
- **The health check must stay in `main`.** It reaches the daemon's I2PControl port on `127.0.0.1`, which only the main procedure can do; init and actions run in a context that cannot, which is why `reloadI2pdTunnels` shells into a temp subcontainer instead.
- **Transit off is policy, not tuning.** Every bandwidth limit i2pd offers caps relayed traffic alone, so `notransit` is the only lever that reaches zero — don't "restore" upstream's default or express off as `transittunnels = 0`.
- **`addI2pTunnel` refuses `bitcoind`'s peer hosts on purpose.** Bitcoin advertises an address only to peers reached on that address's own network, and it reaches I2P peers only through a SAM session holding a destination it owns — so a tunnel address here lands in its config and is gossiped to nobody.
- **A log-filter family is anchored to one complete message, and the list is re-validated on every i2pd bump** — see `UPDATING.md`. Widening a pattern past one known message hides evidence on the day it matters.
