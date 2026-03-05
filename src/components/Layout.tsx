import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, X, Home, BookOpen, FlaskConical, ChevronRight, Sun, Moon } from 'lucide-react';
import { bots, botList, getBotGradient, getBotColor, type BotId } from '@/data/bots';
import { useApp } from '@/contexts/AppContext';
import { useThemeToggle } from '@/contexts/ThemeContext';
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

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, getBotStats } = useApp();
  const { theme, toggleTheme } = useThemeToggle();
  const [aboutBobOpen, setAboutBobOpen] = useState(false);
  const [aboutCashOpen, setAboutCashOpen] = useState(false);
  const [aboutMagOpen, setAboutMagOpen] = useState(false);

  const isQA = location.pathname.startsWith('/qa');
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeBotId = (pathParts.length >= 2 && (pathParts[1] === 'bob' || pathParts[1] === 'cash' || pathParts[1] === 'mag'))
    ? pathParts[1] as BotId : null;
  const activePageSlug = pathParts[2] || '';
  const isHome = location.pathname === '/';

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const breadcrumb = () => {
    const parts: string[] = [];
    if (isQA) parts.push('QA HUB');
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
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-40 shrink-0">
          {!isHome && (
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
          <div className="flex-1" />

          <SearchBar />

          <span className="font-display font-bold text-sm tracking-widest bg-gradient-to-r from-bob via-cash to-mag-2 bg-clip-text text-transparent">
            B.C.M
          </span>

          <div className="flex-1" />

          <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex gap-1 bg-secondary/50 rounded-lg p-0.5">
            <button
              onClick={() => navigate('/')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                !isQA ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <BookOpen className="w-3.5 h-3.5" /> GUIDE
            </button>
            <button
              onClick={() => navigate('/qa')}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                isQA ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              <FlaskConical className="w-3.5 h-3.5" /> QA HUB
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          {!isHome && (
            <>
              <div className={cn(
                "fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity",
                sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )} onClick={() => setSidebarOpen(false)} />
              <aside className={cn(
                "fixed top-14 left-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-30 flex flex-col overflow-y-auto transition-transform duration-300",
                "lg:translate-x-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
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
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-3 border-l-bob"
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
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-3 border-l-current"
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

                            // Special "à propos" entry opens modal instead of navigating
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
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-l-3 border-l-current"
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

          {/* MAIN CONTENT */}
          <main className={cn("flex-1 overflow-y-auto", !isHome && "lg:ml-0")}>
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <AboutBobModal open={aboutBobOpen} onOpenChange={setAboutBobOpen} />
      <AboutCashModal open={aboutCashOpen} onOpenChange={setAboutCashOpen} />
      <AboutMagModal open={aboutMagOpen} onOpenChange={setAboutMagOpen} />
    </>
  );
}
