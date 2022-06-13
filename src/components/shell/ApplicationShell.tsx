import { Dashboard, People } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, ListSubheader } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import content from '../../content/content';
import { navigationStructure } from '../../content/content';

const drawerWidth = 240;

type NavigationItem = {
    name: string,
    target: string,
    icon: ReactElement,
}

const navigationItems: NavigationItem[] = [
    { name: "Dashboard", target: "/", icon: <Dashboard /> },
]

const contentNavigationItems: NavigationItem[] = Object.keys(content).map((key) => ({
    name: content[key].pluralTitle ?? content[key].title,
    target: `/content/${key}`,
    icon: content[key].icon
}))

export interface ActionItem {
    icon: ReactElement,
    title: string,
    onClick: Function
}

interface Props {
    title: string,
    actionItems?: ActionItem[]
}

export default function ApplicationShell(props: React.PropsWithChildren<Props>) {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navigation =
        Object.keys(navigationStructure).map((key) => {
            return <>
                <Divider />
                <List
                    subheader={
                        <ListSubheader>
                            {key}
                        </ListSubheader>
                    }>
                    {navigationStructure[key].map((item, index) => (
                        <ListItem key={content[item].pluralTitle ?? content[item].title} disablePadding>
                            <ListItemButton selected={location.pathname === `/content/${item}`} component={Link} to={`/content/${item}`}>
                                <ListItemIcon>
                                    {content[item].icon}
                                </ListItemIcon>
                                <ListItemText primary={content[item].pluralTitle ?? content[item].title} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </>
        });

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                {navigationItems.map((item, index) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemButton selected={location.pathname === item.target} component={Link} to={item.target}>
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            {navigation}
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {props.title}
                    </Typography>
                    {props.actionItems && props.actionItems.map((item) =>
                        <Button startIcon={item.icon} key={item.title} onClick={() => { item.onClick() }} color='inherit'>
                            {item.title}
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
            >
                <Toolbar />
                {props.children}
            </Box>
        </Box>
    );
}
