import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X, Home, BookOpen, FlaskConical, ChevronRight, Sun, Moon, Gamepad2, Youtube } from 'lucide-react';
import { bots, botList, getBotGradient, getBotColor, type BotId } from '@/data/bots';
import { useApp } from '@/contexts/AppContext';
import { useThemeToggle } from '@/contexts/ThemeContext';
import { useQAAuth } from '@/components/QAPasswordGate';
import SearchBar from '@/components/SearchBar';
import BotLogo from '@/components/BotLogo';
import AboutBobModal from '@/components/AboutBobModal';
import AboutCashModal from '@/components/AboutCashModal';
import AboutMagModal from '@/components/AboutMagModal';
import { cn } from '@/lib/utils';

const sidebarIcons: Record<string, string> = {
  'Accueil': '🏠', 'Mode Normal': '💬', 'Mode Précis': '🎯',
  'Agenda & Mails': '📅', 'Musique': '🎵', 'Mini B.O.B Info': '🌅',
  'Architecture': '⚙️', 'Prompts': '🧬', 'Patch Notes': '📋', 'Limites connues': '⚠️', 'Glossaire': '📖', 'à propos': '❓',
  'Ajouter': '➕', 'Consulter & Rechercher': '🔍', 'Modifier & Supprimer': '✏️', 'Bilan Mensuel': '📊',
  'Catégories': '📂', 'Notifications': '🔔',
};

const mainNavItems = [
  { id: 'guide', label: 'Guide', icon: BookOpen, path: '/' },
  { id: 'mini-jeux', label: 'Mini Jeux', icon: Gamepad2, path: '/mini-jeux' },
  { id: 'tutos', label: 'Tutos', icon: Youtube, path: '/tutos' },
  { id: 'dev', label: 'Dév.', icon: FlaskConical, path: '/qa' },
];

function getActiveNav(pathname: string): string {
  if (pathname.startsWith('/qa')) return 'dev';
  if (pathname.startsWith('/mini-jeux')) return 'mini-jeux';
  if (pathname.startsWith('/tutos')) return 'tutos';
  return 'guide';
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, getBotStats } = useApp();
  const { theme, toggleTheme } = useThemeToggle();
  const { authenticated: qaAuthenticated } = useQAAuth();
  const [aboutBobOpen, setAboutBobOpen] = useState(false);
  const [aboutCashOpen, setAboutCashOpen] = useState(false);
  const [aboutMagOpen, setAboutMagOpen] = useState(false);

  const isQA = location.pathname.startsWith('/qa');
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeBotId = (pathParts.length >= 2 && (pathParts[1] === 'bob' || pathParts[1] === 'cash' || pathParts[1] === 'mag'))
    ? pathParts[1] as BotId : null;
  const activePageSlug = pathParts[2] || '';
  const activeNav = getActiveNav(location.pathname);

  // Show contextual sidebar only on guide bot pages or authenticated QA pages
  const showContextualSidebar = (activeBotId && !isQA) || (isQA && qaAuthenticated);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const breadcrumb = () => {
    const parts: string[] = [];
    if (isQA) parts.push('DÉVELOPPEUR');
    else if (location.pathname.startsWith('/mini-jeux')) parts.push('MINI JEUX');
    else if (location.pathname.startsWith('/tutos')) parts.push('TUTOS');
    else parts.push('GUIDE');
    if (activeBotId) parts.push(bots[activeBotId].name);
    if (activePageSlug) {
      const bot = activeBotId ? bots[activeBotId] : null;
      const page = bot?.guideNav.flatMap(g => g.items).find(i => i.slug === activePageSlug);
      if (page) parts.push(page.title);
    }
    return parts;
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {/* TOP BAR */}
        <header className="h-14 min-h-[3.5rem] border-b border-border bg-card/50 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-40 shrink-0">
          {showContextualSidebar && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          <Link to="/" className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumb().map((part, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === breadcrumb().length - 1 ? 'text-foreground font-medium' : ''}>{part}</span>
              </span>
            ))}
          </div>
          <SearchBar />
          <div className="flex-1" />

          <span className="font-display font-bold text-sm tracking-widest">
            <span className="text-bob">B</span>.<span className="text-cash">C</span>.<span className="text-mag-2">M</span>
          </span>

          <div className="flex-1" />

          <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* MAIN SIDEBAR (LEFT) - always visible on desktop */}
          <div className="hidden lg:block w-16 shrink-0" />
          <aside className="hidden lg:flex fixed top-[3.5rem] left-0 bottom-0 w-16 bg-sidebar border-r border-sidebar-border flex-col items-center py-4 gap-1 z-30">
            {mainNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center gap-1 w-14 py-2.5 rounded-xl text-[10px] font-medium transition-all",
                  activeNav === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </aside>

          {/* Mobile: main nav inside hamburger is handled below with contextual sidebar */}

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto">
            {/* Mobile bottom nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border flex items-center justify-around py-1.5">
              {mainNavItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-all",
                    activeNav === item.id
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/50"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", activeNav === item.id && "text-primary")} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="animate-fade-in pb-16 lg:pb-0">
              <Outlet />
            </div>
          </main>

          {/* CONTEXTUAL SIDEBAR (RIGHT) */}
          {showContextualSidebar && (
            <>
              <div className={cn(
                "fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity",
                sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )} onClick={() => setSidebarOpen(false)} />
              <div className="hidden lg:block w-64 shrink-0" />
              <aside className={cn(
                "fixed top-[3.5rem] right-0 bottom-0 w-64 bg-sidebar border-l border-sidebar-border z-30 flex flex-col overflow-y-auto transition-transform duration-300",
                "lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
              )}>
                {isQA ? (
                  <nav className="p-3 space-y-1">
                    {/* BCM Header */}
                    <div className="text-center py-3 mb-2">
                      <div className="text-lg font-display font-extrabold tracking-widest">
                        <span className="text-bob">B</span>.<span className="text-cash">C</span>.<span className="text-mag-2">M</span>
                      </div>
                      <div className="flex justify-center gap-2 mt-2">
                         {botList.map(id => (
                          <BotLogo key={id} botId={id} size="xs" />
                        ))}
                      </div>
                    </div>
                    <Link to="/qa" className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      location.pathname === '/qa'
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-3 border-r-bob"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50")}>
                      <span className="w-2 h-2 rounded-full bg-bob" />
                      🏠 Accueil
                    </Link>
                    {botList.map(id => {
                      const bot = bots[id];
                      const stats = getBotStats(id);
                      const completed = stats.ok + stats.partial + stats.fail;
                      return (
                        <Link key={id} to={`/qa/${id}`} className={cn("flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          activeBotId === id
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-3 border-r-current"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50")}>
                          <span className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", id === 'bob' ? 'bg-bob' : id === 'cash' ? 'bg-cash' : 'bg-mag-2')} />
                            <BotLogo botId={id} size="xs" /> {bot.name}
                          </span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded-full",
                            completed === stats.total ? "bg-cash/20 text-cash" : "bg-secondary text-muted-foreground")}>
                            {completed}/{stats.total}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                ) : (
                  <>
                    {/* Bot tabs */}
                    <div className="flex border-b border-sidebar-border">
                      {botList.map(id => (
                        <button key={id} onClick={() => navigate(`/guide/${id}`)}
                          className={cn("flex-1 py-3 text-xs font-bold tracking-wider text-center transition-all border-b-2",
                            activeBotId === id
                              ? `border-current ${getBotColor(id)} bg-sidebar-accent/50`
                              : "border-transparent text-sidebar-foreground/50 hover:text-sidebar-foreground/80")}>
                          {bots[id].name}
                        </button>
                      ))}
                    </div>
                    {/* Nav groups */}
                    {activeBotId && bots[activeBotId].guideNav.map(group => (
                      <div key={group.group} className="p-3">
                        <div className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground mb-2 px-3">{group.group}</div>
                        <div className="space-y-0.5">
                          {group.items.map(item => {
                            const icon = sidebarIcons[item.title] || '📄';

                            if (item.slug === 'a-propos' && (activeBotId === 'bob' || activeBotId === 'cash' || activeBotId === 'mag')) {
                              const openFn = activeBotId === 'bob' ? () => setAboutBobOpen(true) : activeBotId === 'cash' ? () => setAboutCashOpen(true) : () => setAboutMagOpen(true);
                              return (
                                <button key="a-propos" onClick={openFn}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full text-left">
                                  <span className="text-sm">{icon}</span>
                                  <em>{item.title}</em>
                                </button>
                              );
                            }

                            const href = item.slug ? `/guide/${activeBotId}/${item.slug}` : `/guide/${activeBotId}`;
                            const active = item.slug ? activePageSlug === item.slug : (!activePageSlug && location.pathname === `/guide/${activeBotId}`);
                            return (
                              <Link key={item.slug || 'home'} to={href}
                                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                                  active
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-3 border-r-current"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50")}>
                                <span className="text-sm">{icon}</span>
                                {item.title}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!activeBotId && (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        Sélectionnez un bot pour voir la navigation
                      </div>
                    )}
                  </>
                )}
              </aside>
            </>
          )}
        </div>
      </div>
      <AboutBobModal open={aboutBobOpen} onOpenChange={setAboutBobOpen} />
      <AboutCashModal open={aboutCashOpen} onOpenChange={setAboutCashOpen} />
      <AboutMagModal open={aboutMagOpen} onOpenChange={setAboutMagOpen} />
    </>
  );
}
