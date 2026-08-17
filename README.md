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

Router settings cover the bandwidth share, whether to relay transit traffic, whether to run as a floodfill router, the log level, and optional overrides for the external address and reseed source.

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

**SAM is bound on 7656 with no interface exported**, and that is a security decision: the SAM interface is unauthenticated, so it is reachable by other services over the internal bridge and from nowhere else — never on the LAN, clearnet, or Tor.

**The two transport ports are exported so they can be forwarded.** Without a consistent external port mapping the router reports itself firewalled behind a symmetric NAT, and inbound tunnel delivery fails — which breaks every server tunnel this package issues. They are interfaces so the user can allow that forwarding.

## Installation and First-Run Flow

Install seeds the configuration and generates the two `.conf` files. The router starts immediately.

**The first three to ten minutes are spent finding peers and integrating into the network**, and the router is not usable until that finishes. A "loading" state on a fresh install is normal, not a fault.

Addresses for other services are not created here — they are requested from the other service's own interface settings, through the plugin, which is why this package's own actions for them are hidden.

## Actions

Three actions, and two of them are hidden.

### Configure Router

The router's own settings: bandwidth share, transit traffic, floodfill, log level, external address, and reseed URL.

- **What it changes:** the router settings in the model, and through them the generated configuration.
- **Cost:** applies on restart.
- **Repeat safety:** idempotent.
- **The settings with real consequences are the network-facing ones.** Relaying transit traffic and running as a floodfill router both make this node carry other people's traffic — good for the network, and a meaningful increase in bandwidth and connections. The bandwidth share caps that.
- **The external address override is for hosts the router cannot detect correctly**, and setting it wrongly is a good way to become unreachable.

### Add I2P Tunnel — hidden

**Not user-facing in the Actions list.** It is the action the URL plugin invokes when a user asks for an I2P address on another service's interface, so it is reached from _there_, not from here.

- **What it changes:** generates a key, derives the address, records the tunnel in the model, and regenerates the tunnel configuration.
- **It can also import an existing key**, which is how an address is moved between servers.
- **Repeat safety:** each run without an imported key produces a **new** address.

### Delete I2P Tunnel — hidden

The counterpart, also invoked through the plugin.

- **What it changes:** removes the tunnel and **deletes its key**.
- **This is irreversible.** The address cannot be reissued without the key it was derived from.

## Tasks

None. This package raises no tasks, so the service is never held on a prompt and its ordinary controls are always available.

## Health Checks

One check, on the router.

| Check  | Displayed as  | Method             |
| ------ | ------------- | ------------------ |
| `i2pd` | "I2P Network" | The router's state |

It reports the router's integration with the network rather than a bound port, which is what makes the first several minutes read as loading rather than failing.

A router that stays unintegrated for much longer than that is usually a network-reachability problem — the transport ports not being forwarded is the common cause, and it also shows in the router console as a firewalled status.

## Backups and Restore

The `i2pd` volume is copied wholesale — `sdk.Backups.ofVolumes('i2pd')`. That is the router identity, the configuration, and **every tunnel key**.

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
  - add-i2p-tunnel # hidden; invoked via the URL plugin
  - delete-i2p-tunnel # hidden; invoked via the URL plugin
tasks: []
health_checks:
  - i2pd # displayed "I2P Network"; reports network integration
```
