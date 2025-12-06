import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { RootHeader } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
	component: () => (
		<>
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<span className="p-2 h-screen w-screen flex flex-col ">
					<RootHeader />
					<Outlet />
				</span>
			</ThemeProvider>
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</>
	),
});
