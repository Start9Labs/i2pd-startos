# I2P Instructions

## Documentation

- [i2pd documentation](https://i2pd.readthedocs.io/) — the upstream operator and configuration reference for the router.

## Getting Started

I2P starts immediately upon launch. The first 3 to 10 minutes are spent finding peers and integrating into the network. The status card will show a "loading" message during this initialization period, which is completely normal.

## Warnings

- **Uninstalling I2P permanently deletes all I2P tunnel keys and `.b32.i2p` addresses.** Any service reachable through one of those addresses will lose it. Make a backup first if you want to keep your addresses.

## Browsing I2P Sites

To browse the invisible web, configure your web browser's proxy settings to use this server's IP address with the following ports:

- **HTTP proxy:** port 4444
- **SOCKS5 proxy:** port 4447

Please note that these proxies only work for routing traffic to internal .i2p and .b32.i2p addresses. They are not general-purpose privacy proxies for accessing the regular internet (clearnet).

## Hosting Services on I2P

To assign a hidden .b32.i2p address to any installed application, open that specific service, navigate to the Interfaces section, and add a new I2P address from the URL table to make it accessible within the network. When adding one you can paste the base64-encoded contents of an existing i2pd `.dat` key file to reuse a known address, or leave it blank to generate a fresh one.

The address appears in the URL table immediately, but expect a few minutes before it is reachable over I2P — the router has to build inbound tunnels and publish the address to the network first.

**Bitcoin is the exception.** It speaks I2P natively through this router's SAM bridge and derives its own `.b32.i2p` address, so adding a tunnel to its Peer interface does nothing useful and is refused. Enable I2P in Bitcoin's own **Peer Settings** instead.

## Relaying for Others

By default this router carries only the traffic of your own services — it relays nothing for anyone else, so running it costs you no bandwidth beyond what you use.

I2P depends on volunteers who do relay, so turning it on is a real contribution. Use the **Configure Router** action, set **Transit Tunnels** to Enabled, and choose how much to give: **Share** is the percentage of the bandwidth class you are willing to hand to relayed traffic, and **Maximum Transit Tunnels** caps how many you carry at once. Every bandwidth setting here bounds relayed traffic only; none of them limits your own.

## If the Router Gets Stuck

A router that cannot find peers — no tunnels after twenty minutes, or a health check reporting no peers found — usually has a stale or empty view of the network.

Run the **Reset Router** action. It clears what the router has cached about the network and restarts so it finds peers from scratch. It takes several minutes to integrate again. Your `.b32.i2p` addresses and the router's own identity are not touched.

If it happens repeatedly, the cause is usually that this server cannot resolve DNS — the router reseeds over HTTPS by hostname. Check **System > DNS Servers**.

## Router Console

Open the **I2P Router Console** from this service's Interfaces section to monitor the router: network status (OK / Firewalled), tunnel creation success rate, known routers, and active tunnels.

## NAT and Reachability

I2P may work behind a NAT out of the box by using intermediary relay nodes. If it does not, or your tunnels remain unreachable, you will need to manually port-forward.

### Port Forwarding Steps

For significantly better performance and to be classified as a directly-reachable ("O-type") router:

1. **Configure your router to forward:**
   - **UDP port 4450** → StartOS IP (e.g., 10.0.0.6):4450 for SSU2 transport
   - **TCP port 4451** → StartOS IP (e.g., 10.0.0.6):4451 for NTCP2 transport

2. **In StartOS I2P service**, use the **Configure Router** action to:
   - Set your external IP address or hostname in **External IP / Hostname** field
   - This enables the router to advertise its reachability to peers

Once port forwarding is confirmed, restart the I2P service and wait 5–10 minutes for the router to stabilize. It should transition from "Firewalled" to "OK" status.
