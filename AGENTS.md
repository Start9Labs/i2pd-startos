# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Never delete a tunnel key without meaning to.** A `.b32.i2p` address is `base32(SHA256(destination))` of the key material, so a lost key is a permanently lost address. The plugin's cleanup prunes **only** on a confirmed-gone host — `sdk.host.get` returning `null`. A _thrown_ lookup keeps the entry and its key, because an unresolvable legacy entry is not evidence the host is gone.
- **`i2pd.conf` and `tunnels.conf` are generated, and re-emitted on every init.** That is what lets a package upgrade ship generator changes; don't turn either into a file model, and don't expect a hand edit to survive.
- **SAM is bound with no exported interface, deliberately.** It is unauthenticated, so it must stay reachable over the bridge only — never on LAN, clearnet or Tor.
- **The SSU2 and NTCP2 ports are exported so they can be forwarded.** Without a consistent external mapping i2pd reports "Firewalled - Symmetric NAT" and inbound tunnel delivery fails, which breaks every server tunnel this package issues.
- **The tunnel actions are `visibility: 'hidden'` on purpose.** They are the URL plugin's table action, reached from another service's interface settings; surfacing them here would invite creating orphan tunnels.
