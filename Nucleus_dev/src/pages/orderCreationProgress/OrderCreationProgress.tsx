import { useLocation } from "react-router-dom";
// import { useEffect, useRef } from "react";

export default function OrderCreationProgress() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const stage = params.get("stage"); // e.g. "complete"

    // Flags for UI
    const isValidateDone = stage === "staging" || stage === "complete";
    const isStagingDone = stage === "complete";

    const config = ["set version 23.4R2.13",
        "set groups phcd_user_script system scripts op allow-url-for-python",
        "set groups phcd_user_script system scripts language python",
        "set apply-groups phcd_user_script",
        "set system host-name nfx350-rrr1",
        "set system root-authentication encrypted-password $6$at7r3G9n$uLsxx41IGo3K1YQEqZoxlZuj77nP16teI0RHvrXIloYF1nbACLfsdS5eAe4cCpdUsHEhRzFuR9c22sM2BZNHw1",
        "set system login user admin uid 2000",
        "set system login user admin class super-user",
        "set system login user admin authentication encrypted-password $6$4dnn.HDl$PD8OyfQBrPK2LELnm.F5Xsi4mr4/FxNX6dwnZCvCbMaju45k6u.5qmH0D8CKQ.Y/dLEG.48X94DKrcQXlCzJu/",
        "set system login message Welcome to Richardson - Test Node. Authorized access only.",
        "set system services netconf ssh",
        "set system services netconf rfc-compliant",
        "set system services netconf yang-compliant",
        "set system services ssh",
        "set system services dhcp-local-server group jdhcp-group interface ge-1/0/0.1",
        "set system services web-management https system-generated-certificate",
        "set system services web-management https interface fxp0.0",
        "set system services web-management https interface ge-1/0/0.1",
        "set system name-server 8.8.8.8",
        "set system name-server 8.8.4.4",
        "set system syslog archive size 100k",
        "set system syslog archive files 3",
        "set system syslog user * any emergency",
        "set system syslog file interactive-commands interactive-commands any",
        "set system syslog file messages any notice",
        "set system syslog file messages authorization info",
        "set system phone-home server https://redirect.juniper.net",
        "set system phone-home rfc-compliant",
        "set system memory hugepages page-size 1024 page-count 4",
        "set security log mode stream",
        "set security nat source rule-set trust-to-untrust from zone trust",
        "set security nat source rule-set trust-to-untrust to zone untrust",
        "set security nat source rule-set trust-to-untrust rule source-nat-rule match source-address 0.0.0.0/0",
        "set security nat source rule-set trust-to-untrust rule source-nat-rule then source-nat interface",
        "set security policies from-zone trust to-zone trust policy trust-to-trust match source-address any",
        "set security policies from-zone trust to-zone trust policy trust-to-trust match destination-address any",
        "set security policies from-zone trust to-zone trust policy trust-to-trust match application any",
        "set security policies from-zone trust to-zone trust policy trust-to-trust then permit",
        "set security policies from-zone trust to-zone untrust policy trust-to-untrust match source-address any",
        "set security policies from-zone trust to-zone untrust policy trust-to-untrust match destination-address any",
        "set security policies from-zone trust to-zone untrust policy trust-to-untrust match application any",
        "set security policies from-zone trust to-zone untrust policy trust-to-untrust then permit",
        "set security zones security-zone untrust interfaces ge-1/0/1.2 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.2 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.2 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.3 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.3 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.3 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.4 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.4 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.4 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.5 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.5 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.5 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.6 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.6 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.6 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.7 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.7 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.7 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.8 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.8 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.8 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces ge-1/0/1.9 host-inbound-traffic system-services dhcp",
        "set security zones security-zone untrust interfaces ge-1/0/1.9 host-inbound-traffic system-services dhcpv6",
        "set security zones security-zone untrust interfaces ge-1/0/1.9 host-inbound-traffic system-services tftp",
        "set security zones security-zone untrust interfaces dl0.0 host-inbound-traffic system-services tftp",
        "set security zones security-zone trust host-inbound-traffic system-services all",
        "set security zones security-zone trust host-inbound-traffic protocols all",
        "set security zones security-zone trust interfaces ge-1/0/0.1",
        "set interfaces ge-0/0/0 enable",
        "set interfaces ge-0/0/0 ether-options auto-negotiation",
        "set interfaces ge-0/0/0 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/0 unit 0 family ethernet-switching storm-control default",
        "set interfaces sxe-0/0/0 ether-options flow-control",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching interface-mode trunk",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members default",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-2",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-3",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-4",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-5",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-6",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-7",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-8",
        "set interfaces sxe-0/0/0 unit 0 family ethernet-switching vlan members vlan-9",
        "set interfaces ge-0/0/1 enable",
        "set interfaces ge-0/0/1 unit 0 enable",
        "set interfaces ge-0/0/1 unit 0 family ethernet-switching interface-mode trunk",
        "set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members VLAN1650",
        "set interfaces ge-0/0/1 unit 0 family ethernet-switching storm-control default",
        "set interfaces sxe-0/0/1 ether-options flow-control",
        "set interfaces sxe-0/0/1 unit 0 family ethernet-switching interface-mode trunk",
        "set interfaces sxe-0/0/1 unit 0 family ethernet-switching vlan members VLAN1650",
        "set interfaces ge-0/0/2 enable",
        "set interfaces ge-0/0/2 ether-options auto-negotiation",
        "set interfaces ge-0/0/2 unit 0 enable",
        "set interfaces ge-0/0/2 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/2 unit 0 family ethernet-switching storm-control default",
        "set interfaces sxe-0/0/2 ether-options flow-control",
        "set interfaces ge-0/0/3 enable",
        "set interfaces ge-0/0/3 ether-options auto-negotiation",
        "set interfaces ge-0/0/3 unit 0 enable",
        "set interfaces ge-0/0/3 unit 0 family ethernet-switching vlan members VLAN1650",
        "set interfaces ge-0/0/3 unit 0 family ethernet-switching storm-control default",
        "set interfaces sxe-0/0/3 ether-options flow-control",
        "set interfaces ge-0/0/4 enable",
        "set interfaces ge-0/0/4 ether-options auto-negotiation",
        "set interfaces ge-0/0/4 unit 0 enable",
        "set interfaces ge-0/0/4 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/4 unit 0 family ethernet-switching storm-control default",
        "set interfaces ge-0/0/5 enable",
        "set interfaces ge-0/0/5 ether-options auto-negotiation",
        "set interfaces ge-0/0/5 unit 0 enable",
        "set interfaces ge-0/0/5 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/5 unit 0 family ethernet-switching storm-control default",
        "set interfaces ge-0/0/6 description NFX350_Test",
        "set interfaces ge-0/0/6 enable",
        "set interfaces ge-0/0/6 ether-options auto-negotiation",
        "set interfaces ge-0/0/6 unit 0 enable",
        "set interfaces ge-0/0/6 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/6 unit 0 family ethernet-switching storm-control default",
        "set interfaces ge-0/0/7 description NFX350_Test1",
        "set interfaces ge-0/0/7 enable",
        "set interfaces ge-0/0/7 ether-options auto-negotiation",
        "set interfaces ge-0/0/7 unit 0 enable",
        "set interfaces ge-0/0/7 unit 0 family ethernet-switching vlan members default",
        "set interfaces ge-0/0/7 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/8 unit 0 family ethernet-switching vlan members vlan-2",
        "set interfaces xe-0/0/8 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/9 unit 0 family ethernet-switching vlan members vlan-3",
        "set interfaces xe-0/0/9 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/10 unit 0 family ethernet-switching vlan members vlan-4",
        "set interfaces xe-0/0/10 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/11 unit 0 family ethernet-switching vlan members vlan-5",
        "set interfaces xe-0/0/11 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/12 unit 0 family ethernet-switching vlan members vlan-6",
        "set interfaces xe-0/0/12 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/13 unit 0 family ethernet-switching vlan members vlan-7",
        "set interfaces xe-0/0/13 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/14 unit 0 family ethernet-switching vlan members vlan-8",
        "set interfaces xe-0/0/14 unit 0 family ethernet-switching storm-control default",
        "set interfaces xe-0/0/15 unit 0 family ethernet-switching vlan members vlan-9",
        "set interfaces xe-0/0/15 unit 0 family ethernet-switching storm-control default",
        "set interfaces ge-1/0/0 vlan-tagging",
        "set interfaces ge-1/0/0 unit 1 vlan-id 1",
        "set interfaces ge-1/0/0 unit 1 family inet address 192.168.5.151/24",
        "set interfaces ge-1/0/1 vlan-tagging",
        "set interfaces ge-1/0/1 unit 2 vlan-id 2",
        "set interfaces ge-1/0/1 unit 2 family inet dhcp",
        "set interfaces ge-1/0/1 unit 2 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 2 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 2 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 3 vlan-id 3",
        "set interfaces ge-1/0/1 unit 3 family inet dhcp",
        "set interfaces ge-1/0/1 unit 3 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 3 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 3 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 4 vlan-id 4",
        "set interfaces ge-1/0/1 unit 4 family inet dhcp",
        "set interfaces ge-1/0/1 unit 4 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 4 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 4 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 5 vlan-id 5",
        "set interfaces ge-1/0/1 unit 5 family inet dhcp",
        "set interfaces ge-1/0/1 unit 5 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 5 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 5 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 6 vlan-id 6",
        "set interfaces ge-1/0/1 unit 6 family inet dhcp",
        "set interfaces ge-1/0/1 unit 6 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 6 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 6 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 7 vlan-id 7",
        "set interfaces ge-1/0/1 unit 7 family inet dhcp",
        "set interfaces ge-1/0/1 unit 7 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 7 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 7 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 8 vlan-id 8",
        "set interfaces ge-1/0/1 unit 8 family inet dhcp",
        "set interfaces ge-1/0/1 unit 8 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 8 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 8 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/1 unit 9 vlan-id 9",
        "set interfaces ge-1/0/1 unit 9 family inet dhcp",
        "set interfaces ge-1/0/1 unit 9 family inet6 dhcpv6-client client-type autoconfig",
        "set interfaces ge-1/0/1 unit 9 family inet6 dhcpv6-client client-ia-type ia-na",
        "set interfaces ge-1/0/1 unit 9 family inet6 dhcpv6-client client-identifier duid-type duid-ll",
        "set interfaces ge-1/0/4 enable",
        "set interfaces cl-1/1/0 dialer-options pool 1 priority 100",
        "set interfaces dl0 unit 0 family inet negotiate-address",
        "set interfaces dl0 unit 0 family inet6 negotiate-address",
        "set interfaces dl0 unit 0 dialer-options pool 1",
        "set interfaces dl0 unit 0 dialer-options always-on",
        "set interfaces dl0 unit 0 dialer-options dial-string 1234",
        "set interfaces fxp0 unit 0 family inet address 192.168.1.1/24",
        "set snmp name nfx350-r1",
        "set snmp description NFX350 SNMP Monitoring",
        "set snmp proxy libvirt-proxy device-name 192.168.5.151",
        "set snmp proxy libvirt-proxy version-v2c snmp-community libvirt-comm",
        "set snmp proxy libvirt-proxy nfx-host",
        "set snmp client-list SNMP-ACL 10.168.170.63/24",
        "set snmp community public authorization read-only",
        "set snmp community public clients 192.168.5.0/24",
        "set snmp trap-group mgmt-traps targets 192.168.5.200",
        "set snmp trap-group mgmt-traps targets 192.168.5.53",
        "set forwarding-options storm-control-profiles default all",
        "set event-options policy suppress-over-temp events CHASSISD_SNMP_TRAP7",
        "set event-options policy suppress-over-temp then ignore",
        "set policy-options prefix-list local_aggregate",
        "set access address-assignment pool jdhcp-group family inet network 192.168.2.0/24",
        "set access address-assignment pool jdhcp-group family inet range junosRange low 192.168.2.2",
        "set access address-assignment pool jdhcp-group family inet range junosRange high 192.168.2.254",
        "set access address-assignment pool jdhcp-group family inet dhcp-attributes router 192.168.2.1",
        "set access address-assignment pool jdhcp-group family inet dhcp-attributes propagate-settings ge-1/0/1.2",
        "set protocols router-advertisement interface ge-1/0/1.2",
        "set protocols router-advertisement interface ge-1/0/1.3",
        "set protocols router-advertisement interface ge-1/0/1.4",
        "set protocols router-advertisement interface ge-1/0/1.5",
        "set protocols router-advertisement interface ge-1/0/1.6",
        "set protocols router-advertisement interface ge-1/0/1.7",
        "set protocols router-advertisement interface ge-1/0/1.8",
        "set protocols router-advertisement interface ge-1/0/1.9",
        "set protocols lldp interface all",
        "set protocols lldp-med interface all",
        "set protocols igmp-snooping vlan default",
        "set protocols rstp interface ge-0/0/0",
        "set protocols rstp interface ge-0/0/1",
        "set protocols rstp interface ge-0/0/2",
        "set protocols rstp interface ge-0/0/3",
        "set protocols rstp interface ge-0/0/4",
        "set protocols rstp interface ge-0/0/5",
        "set protocols rstp interface ge-0/0/6",
        "set protocols rstp interface ge-0/0/7",
        "set protocols rstp interface xe-0/0/8",
        "set protocols rstp interface xe-0/0/9",
        "set protocols rstp interface xe-0/0/10",
        "set protocols rstp interface xe-0/0/11",
        "set protocols rstp interface xe-0/0/12",
        "set protocols rstp interface xe-0/0/13",
        "set protocols rstp interface xe-0/0/14",
        "set protocols rstp interface xe-0/0/15",
        "set protocols rstp interface all",
        "set routing-options static route 0.0.0.0/0 next-hop 192.168.5.200",
        "set vlans VLAN100 vlan-id 100",
        "set vlans VLAN1650 vlan-id 1650",
        "set vlans VLAN200 vlan-id 200",
        "set vlans default vlan-id 1",
        "set vlans vlan-2 vlan-id 2",
        "set vlans vlan-3 vlan-id 3",
        "set vlans vlan-4 vlan-id 4",
        "set vlans vlan-5 vlan-id 5",
        "set vlans vlan-6 vlan-id 6",
        "set vlans vlan-7 vlan-id 7",
        "set vlans vlan-8 vlan-id 8",
        "set vlans vlan-9 vlan-id 9",
        "set vmhost virtualization-options interfaces ge-1/0/1 mapping interface hsxe0",
        "set vmhost virtualization-options interfaces ge-1/0/2 mapping interface hsxe1",
        "set vmhost virtualization-options interfaces ge-1/0/3 mapping interface hsxe2",
        "set vmhost virtualization-options interfaces ge-1/0/4 mapping interface hsxe3",
        "set vmhost vlans VLAN100 vlan-id 100",
        "set vmhost vlans VLAN1650 vlan-id 1650",
        "set vmhost vlans VLAN2 vlan-id 2",
        "set vmhost vlans VLAN200 vlan-id 200",
        "set vmhost snmp v2c community public",
        "set vmhost snmp v2c community libvirt-comm",
        "set virtual-network-functions velosdwan image /var/public/velo.qcow2",
        "set virtual-network-functions velosdwan virtual-cpu count 4",
        "set virtual-network-functions velosdwan interfaces eth2 description LAN 1 GE3",
        "set virtual-network-functions velosdwan interfaces eth2 mac-address 02:11:c1:8d:ef:03",
        "set virtual-network-functions velosdwan interfaces eth2 mapping vlan mode trunk",
        "set virtual-network-functions velosdwan interfaces eth2 mapping vlan members VLAN1650",
        "set virtual-network-functions velosdwan memory size 8388608",
        "set virtual-network-functions vsrx image /var/public/junos-vsrx3-x86-64-22.4R2.8.qcow2",
        "set virtual-network-functions vsrx image image-type qcow2",
        "set virtual-network-functions vsrx image driver-cache writethrough",
        "set virtual-network-functions vsrx virtual-cpu 0 physical-cpu 7",
        "set virtual-network-functions vsrx virtual-cpu 1 physical-cpu 23",
        "set virtual-network-functions vsrx virtual-cpu count 2",
        "set virtual-network-functions vsrx virtual-cpu features hardware-virtualization",
        "set virtual-network-functions vsrx no-default-interfaces",
        "set virtual-network-functions vsrx interfaces eth0",
        "set virtual-network-functions vsrx interfaces eth1",
        "set virtual-network-functions vsrx interfaces eth2 description _LAN_ LAN",
        "set virtual-network-functions vsrx interfaces eth2 mapping vlan mode trunk",
        "set virtual-network-functions vsrx interfaces eth2 mapping vlan members VLAN100",
        "set virtual-network-functions vsrx interfaces eth2 mapping peer-interfaces ge-0/0/0",
        "set virtual-network-functions vsrx interfaces eth3 description _WAN_ WAN",
        "set virtual-network-functions vsrx interfaces eth3 mapping vlan mode trunk",
        "set virtual-network-functions vsrx interfaces eth3 mapping vlan members VLAN200",
        "set virtual-network-functions vsrx interfaces eth3 mapping peer-interfaces ge-0/0/1",
        "set virtual-network-functions vsrx memory size 4194304",
        "set virtual-network-functions vsrx memory features hugepages page-size 1024"]

    return (
        <div className="w-full bg-white">
            <div className="bg-blue-50 border-t-4 border-blue-500">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <h1 className="font-semibold text-medium text-gray-800 text-center">
                        Workflow
                    </h1>

                    {/* Progress bar */}
                    {/* Steps */}
                    <div className="mt-6 flex items-center justify-between">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${isValidateDone
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "bg-white border-gray-300 text-gray-500"
                                    }`}
                            >
                                1
                            </div>
                            <span className="mt-2 text-sm font-semibold text-gray-700">
                                Validate
                            </span>
                        </div>

                        {/* Line 1 */}
                        <div className="flex-1 relative">
                            <div
                                className={`h-0.5 absolute top-1/2 -translate-y-2 w-full ${isValidateDone ? "bg-green-500" : "bg-gray-300"
                                    }`}
                            ></div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${isStagingDone
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "bg-white border-gray-300 text-gray-500"
                                    }`}
                            >
                                2
                            </div>
                            <span className="mt-2 text-sm font-semibold text-gray-700">
                                Staging
                            </span>
                        </div>

                        {/* Line 2 */}
                        <div className="flex-1 relative">
                            <div
                                className={`h-0.5 absolute top-1/2 -translate-y-2 w-full ${isStagingDone ? "bg-green-500" : "bg-gray-300"
                                    }`}
                            ></div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${stage === "complete"
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "bg-white border-gray-300 text-gray-500"
                                    }`}
                            >
                                3
                            </div>
                            <span className="mt-2 text-sm font-semibold text-gray-700">
                                Complete
                            </span>
                        </div>
                    </div>



                </div>
            </div>
            {/* Content box */}
            <div className="max-w-2xl mx-auto px-6 py-8">
                <h2 className="text-medium font-semibold text-gray-800 mb-4">
                    Configuration
                </h2>
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 h-90 overflow-y-auto">
                    {config.map((item, index) => (
                        <p key={index} className="text-gray-700 text-sm mb-1">
                            {item}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}

