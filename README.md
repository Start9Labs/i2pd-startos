<p align="center">
  <img src="icon.png" alt="I2Pd Logo" width="21%">
</p>

# I2Pd on StartOS

> Everything not listed in this document should behave the same as upstream
> i2pd. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation
> section of `instructions.md` for links.

[i2pd](https://github.com/PurpleI2P/i2pd) is a C++ router for the I2P network. On StartOS it does two jobs: it lets you reach I2P sites through a proxy, and — through the URL plugin — it gives **any other installed service** a `.b32.i2p` address, the same way the Tor package gives them onion addresses.

- **Upstream repo:** <https://github.com/PurpleI2P/i2pd>
- **Wrapper repo:** <https://github.com/Start9-Community/i2pd-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here.

| Property      | Value                               |
| ------------- | ----------------------------------- |
| Image         | Built from this repo's `Dockerfile` |
| Architectures | x86_64, aarch64, riscv64            |

| Subcontainer | Purpose                                                         |
| ------------ | --------------------------------------------------------------- |
| `i2pd-sub`   | The permissions oneshot and the router — the one to `attach` to |

**This package declares the `url-v0` plugin**, which is what lets it hand addresses to other services. That is the significant thing about it: most packages are only reachable, while this one makes other packages reachable.

## Volume and Data Layout

One volume, holding the router's identity and every tunnel's keys.

| Volume | Mount Point | Purpose                                            |
| ------ | ----------- | -------------------------------------------------- |
| `i2pd` | —           | Router identity, generated config, and tunnel keys |

| Path                     | Written by  | Holds                              |
| ------------------------ | ----------- | ---------------------------------- |
| `etc/i2pd/i2pd.conf`     | The package | The generated router configuration |
| `etc/i2pd/tunnels.conf`  | The package | The generated tunnel definitions   |
| One directory per tunnel | The package | That tunnel's key file             |

**Each tunnel's key file is what owns its address.** A `.b32.i2p` address is derived from the key, so losing the key loses the address permanently — there is no way to reissue the same one. This is the single most consequential fact about the package, and it drives everything under [Backups and Restore](#backups-and-restore).

## File Models

One model, and two generated files that are not models.

| File           | Format | Modelled                | Written by                    |
| -------------- | ------ | ----------------------- | ----------------------------- |
| `config.json`  | JSON   | Yes — `FileHelper.json` | Init, the actions, the plugin |
| `i2pd.conf`    | INI    | No — generated          | The package, from the model   |
| `tunnels.conf` | INI    | No — generated          | The package, from the model   |

**The two `.conf` files are outputs, not inputs.** They are regenerated from the model whenever it changes, and re-emitted on every init — so an upgrade picks up generator changes shipped with the new package version. A hand edit to either is overwritten.

The model holds the router settings and a **nested map of tunnels**, keyed by package, then host, then index. That map is the package's record of every address it has issued.

Router settings cover the bandwidth class, whether to relay transit traffic (and if so its bandwidth share and tunnel ceiling), whether to run as a floodfill router, the log level, and optional overrides for the external address and reseed source. A `resetPending` flag also lives here, set by Reset Router and consumed at the next start.

## Dependencies

None. i2pd joins the I2P network directly and needs nothing else on the server.

Other services depend on **it**, though not as a StartOS dependency: they receive addresses through the URL plugin.

## Network Access and Interfaces

Five interfaces, plus one port deliberately bound **without** one.

| Interface           | Id        | Type | Port | Description                        |
| ------------------- | --------- | ---- | ---- | ---------------------------------- |
| I2P HTTP Proxy      | `http`    | api  | 4444 | For browsing I2P sites             |
| I2P SOCKS Proxy     | `socks`   | api  | 4447 | The same, over SOCKS               |
| I2P Router Console  | `console` | ui   | 7070 | Monitoring and managing the router |
| I2P SSU2 Transport  | `ssu2`    | p2p  | 4450 | Peer-to-peer transport (UDP)       |
| I2P NTCP2 Transport | `ntcp2`   | p2p  | 4451 | Peer-to-peer transport (TCP)       |

**The proxies are not general-purpose privacy proxies.** They reach `.i2p` addresses only — unlike Tor's SOCKS proxy, pointing a browser at them does not anonymize ordinary web traffic.

**SAM is bound on 7656 with no interface exported**, and that is a security decision: SAM is unauthenticated and lets a caller create server destinations, not merely proxy outbound, so it is reachable by other services over the internal bridge and from nowhere else — never on the LAN, clearnet, or Tor.

**A dependent resolves it with `sdk.host.getBridgeAddress`**, importing `samHostId` and `samPort` from `i2pd-startos/startos/utils` rather than hardcoding either; `socksHostId` and `socksPort` are exported alongside them for a dependent that must dial `.b32.i2p` peers itself. Those four names are a published contract — nothing in this repo outside `interfaces.ts` references them, so renaming one breaks dependents with no signal here.

**The two transport ports are exported so they can be forwarded.** Without a consistent external port mapping the router reports itself firewalled behind a symmetric NAT, and inbound tunnel delivery fails — which breaks every server tunnel this package issues. They are interfaces so the user can allow that forwarding.

## Installation and First-Run Flow

Install seeds the configuration and generates the two `.conf` files. The router starts immediately.

**The first three to ten minutes are spent finding peers and integrating into the network**, and the router is not usable until that finishes. A "loading" state on a fresh install is normal, not a fault.

Addresses for other services are not created here — they are requested from the other service's own interface settings, through the plugin, which is why this package's own actions for them are hidden.

## Actions

Four actions, and two of them are hidden.

### Configure Router

The router's own settings: bandwidth class, transit traffic, floodfill, log level, external address, and reseed URL.

- **What it changes:** the router settings in the model, and through them the generated configuration.
- **Cost:** applies on restart.
- **Repeat safety:** idempotent; the form is pre-filled.
- **Transit is off by default**, so the router carries only the traffic of services on this server. Enabling it makes the node relay for other I2P users — good for the network, and a meaningful increase in bandwidth and connections — bounded by the share and the transit-tunnel ceiling that appear with it. Floodfill is the other setting that carries other people's traffic.
- **The bandwidth class costs nothing while transit is off.** Every limit i2pd offers — the class, the share, the tunnel ceiling — caps relayed traffic alone and never this router's own, which is why `notransit` rather than a low class is what takes relaying to zero, and why the class can stay high enough for LeaseSet publication to land.
- **The external address override is for hosts the router cannot detect correctly**, and setting it wrongly is a good way to become unreachable.

### Reset Router

Clears what the router has cached about the I2P network and restarts, so it selects peers from scratch.

- **When to run it:** the router cannot find peers, or stays unintegrated long past the first ten minutes.
- **What it changes:** it queues the wipe; the deletion happens at the next start, before any daemon exists — a running router holds netDb and peer profiles in memory and would write the same ones straight back.
- **Cost:** several minutes offline while it reseeds.
- **Repeat safety:** safe to re-run.
- **Your addresses and the router identity are not affected.** The wipe is a deny-list — `netDb/` and `peerProfiles/` — so `tunnels/`, `router.keys` and `router.info` are never in scope.
- **Availability: only while the service is running.**

### Add I2P Tunnel — hidden

**Not user-facing in the Actions list.** It is the action the URL plugin invokes when a user asks for an I2P address on another service's interface, so it is reached from _there_, not from here.

- **What it changes:** generates a key, derives the address, records the tunnel in the model, and regenerates the tunnel configuration.
- **It can also import an existing key**, which is how an address is moved between servers.
- **Repeat safety:** each run without an imported key produces a **new** address.
- **It refuses two targets.** This package's own interfaces, which are not tunnel endpoints; and Bitcoin's peer interfaces, which reach I2P through the SAM bridge and derive their own address, so a server tunnel there would deliver plain TCP that bitcoind reads as bridge-local IPv4 peers.

### Delete I2P Tunnel — hidden

The counterpart, also invoked through the plugin.

- **What it changes:** removes the tunnel and **deletes its key**.
- **This is irreversible.** The address cannot be reissued without the key it was derived from.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One check, on the router.

| Check  | Displayed as  | Method                                     |
| ------ | ------------- | ------------------------------------------ |
| `i2pd` | "I2P Network" | i2pd's I2PControl `RouterInfo` on loopback |

It asks the router for `net.status`, `netdb.knownpeers` and `netdb.activepeers`, so it reports integration with the network rather than a bound port — which is what makes the first several minutes read as starting rather than failing.

**It is written to distinguish "slow" from "never".** Everything reads as starting during a five-minute grace period. Past it, an empty network database means the router never reached a reseed server and will not recover on its own; a reported router error status (8 and above) is surfaced with its number; and a router that has reseeded but built no tunnels yet reports starting, because that one does resolve itself.

**It fails closed.** A reply the router cannot answer properly — a JSON-RPC error object rather than a result — carries no numbers, and every comparison in the check is false against nothing, so such a reply reports starting rather than falling through to success. That matters because the check queries `RouterInfo` without authenticating, which i2pd accepts only because it never validates the token it issues (PurpleI2P/i2pd#2138); if it ever starts validating, every reply becomes an error object.

The empty-network-database case is usually not an I2P fault: reseeding resolves hostnames over the container's resolver, so a server whose DNS is not answering breaks I2P alone and looks like an I2P bug. A router that reseeded but stays unintegrated is usually a reachability problem instead — the transport ports not being forwarded is the common cause, and it also shows in the router console as a firewalled status.

**The router's log stream is filtered before it reaches the service log.** At `warn` a healthy router narrates its routine network weather at ~25 lines a minute, over 98% of its output and none of it actionable. `startos/i2pdLogFilter.ts` drops exactly the measured families — transport-session timeouts and handshake failures, peer-database maintenance, per-stream retry mechanics, tunnel build-and-test churn, SAM per-stream teardown, lookups for departed peers, and undecryptable garlic records. Every pattern is anchored to one complete known message, so any line the list has never seen still passes, and each start logs `i2pd log filter active: N known-weather families`. Kept on purpose because each is failure evidence: everything about reseeding, binding, clock skew and router status; `SAM: Bind`, `SAM: Accept error` and `SAM: I2P acceptor has been reset`, the router-side signature of a SAM bridge that stopped serving; and both LeaseSet-publication complaints. **The filter applies at `warn` only** — a user who selects `info` or `debug` in Configure Router is diagnosing something and gets the raw stream.

## Backups and Restore

The `i2pd` volume, minus what the router rebuilds for itself. Excluded: `netDb/`, `peerProfiles/`, `addressbook/`, `tags/`, `certificates/`, and the pidfile — all re-derived by reseeding. What is left is the configuration, the router identity in `router.keys` and `router.info`, and **every tunnel key**.

**`router.info` is derived state that is deliberately kept.** Restoring `router.keys` without it lands i2pd on a "malformed, creating new" path that emits one `Identity` parse error per netDb entry before it recovers.

**This backup is the only thing standing between you and permanently losing every `.b32.i2p` address you have issued.** The addresses are derived from the keys; without a key, an address is gone and cannot be recreated, and any service that published it becomes unreachable at it forever.

**Uninstalling the package deletes those keys**, with the same effect. Take a backup first if the addresses matter.

A restored instance comes back with the same router identity and the same addresses, and needs several minutes to re-integrate with the network before they resolve again.

## Limitations and Differences

1. **Tunnel keys are irreplaceable.** Losing them — by uninstalling, or by restoring without a backup — permanently loses every address issued.
2. **The proxies reach `.i2p` addresses only.** They are not a general privacy proxy.
3. **SAM is unauthenticated**, and is deliberately reachable only from other services on this server.
4. **The generated `.conf` files are overwritten** on every init and every configuration change; hand edits do not survive.
5. **Both transport ports need forwarding** for inbound tunnels to work, or the router reports itself firewalled.
6. **Integration takes minutes** after every start, not seconds.
7. **The tunnel actions are hidden**, because they belong to the plugin flow on other services' pages.
8. **Transit relaying is off by default.** This router carries only the traffic of services on this server until Configure Router turns transit on.
9. **Bitcoin cannot take a tunnel from here.** It reaches I2P over the SAM bridge and derives its own address; Add I2P Tunnel refuses its peer interfaces.
10. **The router's log is filtered at `warn`**, dropping known-benign network weather. Selecting `info` or `debug` disables the filter along with raising the level.

---

## Quick Reference for AI Consumers

```yaml
package_id: i2pd
image: built from ./Dockerfile
architectures:
  - x86_64
  - aarch64
  - riscv64
subcontainers:
  - i2pd-sub
volumes:
  i2pd: router identity, generated config, and one directory of keys per tunnel
file_models:
  - config.json # i2pd.conf and tunnels.conf are generated from it, not modelled
startos_managed_env_vars: []
dependencies: []
interfaces:
  http: { type: api, port: 4444 } # .i2p addresses only
  socks: { type: api, port: 4447 } # .i2p addresses only
  console: { type: ui, port: 7070 }
  ssu2: { type: p2p, port: 4450 } # forward for inbound tunnels
  ntcp2: { type: p2p, port: 4451 } # forward for inbound tunnels
actions:
  - configure-router
  - reset-router # only-running; queues a netDb wipe applied at next start
  - add-i2p-tunnel # hidden; invoked via the URL plugin
  - delete-i2p-tunnel # hidden; invoked via the URL plugin
tasks: []
health_checks:
  - i2pd # displayed "I2P Network"; I2PControl RouterInfo, 5-min grace period
```

> **For dependent packages:** SAM is an unexported binding on host `sam-multi`,
> port 7656; the i2p-only SOCKS proxy is on `socks-multi`, port 4447. Import
> `samHostId`/`samPort`/`socksHostId`/`socksPort` from
> `i2pd-startos/startos/utils` rather than hardcoding either, and resolve them
> with `sdk.host.getBridgeAddress`. Nothing in this repo outside
> `interfaces.ts` references those names, so a rename here breaks dependents
> silently.
