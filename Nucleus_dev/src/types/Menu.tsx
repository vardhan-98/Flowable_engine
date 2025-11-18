import type { ReactNode } from "react";


export interface SubMenuItem {
    label: string;
    path?: string;
    subChildren?: SubMenuItem[]; 
}
 
export interface MenuItem {
    label: string;
    path?: string;
    icon?: React.ReactNode;
    subMenu?: SubMenuItem[];
}
