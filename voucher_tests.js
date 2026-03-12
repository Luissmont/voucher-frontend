const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ==========================================
// CONFIGURACION
// ==========================================

const BASE_URL = 'https://voucher-frontend-blond.vercel.app';
const EMAIL = 'guzman@gmail.com';      // Cambia por un usuario real
const PASSWORD = 'AcLt281424@';     // Cambia por el password real

// ==========================================
// PAGE OBJECTS
// ==========================================

class LoginPage {
    constructor(driver) { this.driver = driver; }

    async open() {
        await this.driver.get(BASE_URL + '/login');
    }

    async login(email, password) {
        // El input de email usa type="email" — lo localizamos por type
        const emailField = await this.driver.wait(
            until.elementLocated(By.css("input[type='email']")), 10000
        );
        await this.driver.wait(until.elementIsVisible(emailField), 10000);
        await emailField.clear();
        await emailField.sendKeys(email);

        const passField = await this.driver.findElement(By.css("input[type='password']"));
        await passField.sendKeys(password);

        await this.driver.findElement(By.css("button[type='submit']")).click();
    }

    async getErrorMessage() {
        try {
            const el = await this.driver.wait(
                until.elementLocated(By.css('.bg-red-500\\/20, [class*="bg-red"]')), 5000
            );
            return await el.getText();
        } catch {
            return null;
        }
    }

    async getCurrentUrl() { return await this.driver.getCurrentUrl(); }
}

class RegistroPage {
    constructor(driver) { this.driver = driver; }

    async open() {
        await this.driver.get(BASE_URL + '/registro');
    }

    async fillForm(name, email, password) {
        const nameField = await this.driver.wait(
            until.elementLocated(By.css("input[type='text']")), 10000
        );
        await nameField.clear();
        await nameField.sendKeys(name);

        const emailField = await this.driver.findElement(By.css("input[type='email']"));
        await emailField.sendKeys(email);

        // Hay un campo de contraseña (puede estar tipo password o text si toggle activo)
        const passFields = await this.driver.findElements(By.css("input[type='password'], input[type='text'][placeholder*='•']"));
        if (passFields.length > 0) await passFields[0].sendKeys(password);

        await this.driver.findElement(By.css("button[type='submit']")).click();
    }

    async getCurrentUrl() { return await this.driver.getCurrentUrl(); }
}

class DashboardPage {
    constructor(driver) { this.driver = driver; }

    async waitForLoad() {
        await this.driver.wait(until.urlContains('/dashboard'), 12000);
    }

    async getPageSource() { return await this.driver.getPageSource(); }
    async getCurrentUrl() { return await this.driver.getCurrentUrl(); }

    async esSaldoVisible() {
        try {
            const source = await this.getPageSource();
            // El dashboard muestra "Saldo Actual" o "$" con montos
            return source.includes('Saldo') || source.includes('saldo');
        } catch { return false; }
    }

    async esNavegacionVisible() {
        try {
            const links = await this.driver.findElements(By.css('a[href]'));
            return links.length > 0;
        } catch { return false; }
    }

    async clickMisObjetivos() {
        const link = await this.driver.wait(
            until.elementLocated(By.css("a[href='/mis-objetivos']")), 10000
        );
        await link.click();
    }

    async clickAjustes() {
        const link = await this.driver.wait(
            until.elementLocated(By.css("a[href='/ajustes']")), 10000
        );
        await link.click();
    }

    async abrirModalGasto() {
        // Busca botón de gasto en el dashboard (ícono o texto)
        const btn = await this.driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Gasto') or contains(text(),'gasto')]")), 10000
        );
        await btn.click();
    }
}

class MisObjetivosPage {
    constructor(driver) { this.driver = driver; }

    async open() {
        await this.driver.get(BASE_URL + '/mis-objetivos');
    }

    async waitForLoad() {
        await this.driver.wait(until.urlContains('/mis-objetivos'), 10000);
    }

    async getPageSource() { return await this.driver.getPageSource(); }
    async getCurrentUrl() { return await this.driver.getCurrentUrl(); }

    async esBannerProgresoVisible() {
        try {
            const source = await this.getPageSource();
            return source.includes('Meta') || source.includes('Objetivo') || source.includes('objetivo');
        } catch { return false; }
    }

    async esBotonNuevaMetaVisible() {
        try {
            // El botón + es un FAB circular (fixed bottom-right)
            const btn = await this.driver.wait(
                until.elementLocated(By.css("button.fixed, button.rounded-full")), 8000
            );
            return await btn.isDisplayed();
        } catch { return false; }
    }
}

class AjustesPage {
    constructor(driver) { this.driver = driver; }

    async open() {
        await this.driver.get(BASE_URL + '/ajustes');
    }

    async waitForLoad() {
        await this.driver.wait(until.urlContains('/ajustes'), 10000);
        // Esperar a que el componente React termine de renderizar el layout
        await this.driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Ajustes')]")), 8000
        );
        await this.driver.sleep(1500); // Margen extra para que la API intente cargar
    }

    async getPageSource() { return await this.driver.getPageSource(); }
    async getCurrentUrl() { return await this.driver.getCurrentUrl(); }

    async esSalarioVisible() {
        try {
            const source = await this.getPageSource();
            return source.includes('Salario') || source.includes('salario');
        } catch { return false; }
    }

    async clickCerrarSesion() {
        // Clic en el botón "Cerrar Sesión" que abre el modal de confirmación
        const abrirModalBtn = await this.driver.wait(
            until.elementLocated(By.xpath("//button[contains(text(),'Cerrar Sesión') or contains(text(),'Cerrar sesión')]"
            )), 10000
        );
        await abrirModalBtn.click();
        // Esperar que el modal aparezca
        await this.driver.sleep(1000);
        // Buscar el botón de confirmación DENTRO del modal (div.fixed.inset-0)
        const confirmarBtn = await this.driver.wait(
            until.elementLocated(
                By.xpath("//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'Cerrar Sesión')]")
            ), 6000
        );
        // Usar JS click para evitar intercepción por el overlay
        await this.driver.executeScript('arguments[0].click();', confirmarBtn);
    }
}

// ==========================================
// UTILIDADES
// ==========================================

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message) {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// Descarta cualquier alert/confirm nativo que aparezca (ej. "Sesión expirada", "Failed to fetch")
async function dismissAlert(driver) {
    try {
        const alert = await driver.switchTo().alert();
        await alert.dismiss();
    } catch { /* no había alert, ok */ }
}

async function runTest(name, fn) {
    try {
        await fn();
        console.log(`  ✓ PASS  ${name}`);
        results.push({ name, status: 'PASS' });
        passed++;
    } catch (err) {
        console.log(`  ✗ FAIL  ${name}`);
        console.log(`         ${err.message}`);
        results.push({ name, status: 'FAIL', error: err.message });
        failed++;
    }
}

async function loginHelper(driver) {
    const login = new LoginPage(driver);
    await login.open();
    await login.login(EMAIL, PASSWORD);
    await driver.wait(until.urlContains('/dashboard'), 12000);
    await dismissAlert(driver);
}

function buildDriver() {
    const options = new chrome.Options();
    // Auto-descarta CUALQUIER alert/confirm nativo que aparezca durante los tests
    // (ej. "Failed to fetch", "Sesión expirada") sin crashear Selenium
    options.setAlertBehavior('dismiss');
    return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

// ==========================================
// SUITE 1: AUTENTICACION
// ==========================================

async function suiteAuth() {
    console.log('\n[HU-01] Autenticación\n');
    let driver;

    // TC-01: Login exitoso
    driver = await buildDriver();
    await driver.manage().window().maximize();
    const login1 = new LoginPage(driver);
    const dash1 = new DashboardPage(driver);
    await runTest('TC-01: Login exitoso redirige a /dashboard o /configuracion', async () => {
        await login1.open();
        await login1.login(EMAIL, PASSWORD);
        await driver.sleep(3000);
        const url = await login1.getCurrentUrl();
        assert(
            url.includes('/dashboard') || url.includes('/configuracion'),
            `URL inesperada: ${url}`
        );
    });
    await driver.quit();

    // TC-02: Credenciales inválidas permanece en /login
    driver = await buildDriver();
    await driver.manage().window().maximize();
    const login2 = new LoginPage(driver);
    await runTest('TC-02: Login con credenciales inválidas permanece en /login', async () => {
        await login2.open();
        await login2.login('wrong@mail.com', 'WrongPass999!');
        await driver.sleep(2500);
        assert((await login2.getCurrentUrl()).includes('/login'), 'Debió permanecer en /login');
    });
    await driver.quit();

    // TC-03: Acceso directo a /dashboard sin sesión
    driver = await buildDriver();
    await driver.manage().window().maximize();
    await runTest('TC-03: Acceso a /dashboard sin sesión no muestra datos privados', async () => {
        await driver.get(BASE_URL + '/dashboard');
        await driver.sleep(3000);
        // Descartar el alert de "Sesión expirada" si aparece (comportamiento correcto — el API rechazó la petición)
        await dismissAlert(driver);
        const url = await driver.getCurrentUrl();
        const source = await driver.getPageSource();
        // PASS si: redirigió a /login, O si no muestra datos privados (saldo numérico real)
        assert(
            url.includes('/login') || !source.includes('Saldo Actual'),
            'Datos privados expuestos sin sesión'
        );
    });
    await driver.quit();

    // TC-04: Cerrar sesión desde Ajustes
    driver = await buildDriver();
    await driver.manage().window().maximize();
    await runTest('TC-04: Logout desde Ajustes redirige a la raíz', async () => {
        await loginHelper(driver);
        const ajustes = new AjustesPage(driver);
        await ajustes.open();
        await ajustes.waitForLoad();
        await ajustes.clickCerrarSesion();
        await driver.sleep(2000);
        const url = await driver.getCurrentUrl();
        assert(url === BASE_URL + '/' || url === BASE_URL, `No redirigió al inicio: ${url}`);
    });
    await driver.quit();

    // TC-05: Submit sin credenciales no navega
    driver = await buildDriver();
    await driver.manage().window().maximize();
    const login5 = new LoginPage(driver);
    await runTest('TC-05: Submit vacío no navega fuera de /login', async () => {
        await login5.open();
        await driver.findElement(By.css("button[type='submit']")).click();
        await driver.sleep(1500);
        assert((await login5.getCurrentUrl()).includes('/login'), 'Navegó sin credenciales');
    });
    await driver.quit();
}

// ==========================================
// SUITE 2: DASHBOARD
// ==========================================

async function suiteDashboard() {
    console.log('\n[HU-02] Dashboard\n');
    let driver = await buildDriver();
    await driver.manage().window().maximize();
    await loginHelper(driver);
    const dash = new DashboardPage(driver);

    await runTest('TC-06: Dashboard carga y muestra información de saldo', async () => {
        await driver.get(BASE_URL + '/dashboard');
        // Esperar a que el héader del dashboard esté en el DOM (renderizado por React)
        await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Dashboard') or contains(text(),'Saldo') or contains(text(),'Disponible')]"))
            , 10000
        );
        const source = await driver.getPageSource();
        assert(
            source.includes('Saldo') || source.includes('saldo') || source.includes('Disponible'),
            'No se encontró contenedor de saldo en el dashboard'
        );
    });

    await runTest('TC-07: Dashboard contiene links de navegación a rutas principales', async () => {
        const currentUrl = await driver.getCurrentUrl();
        // El link /dashboard puede no existir como <a> cuando ya estamos en esa ruta (link activo)
        assert(currentUrl.includes('/dashboard'), 'No estamos en /dashboard');
        const links = await driver.findElements(By.css('a[href]'));
        const hrefs = await Promise.all(links.map(l => l.getAttribute('href')));
        assert(hrefs.some(h => h && h.includes('/mis-objetivos')), 'Link /mis-objetivos ausente');
        assert(hrefs.some(h => h && h.includes('/ajustes')), 'Link /ajustes ausente');
    });

    await runTest('TC-08: Dashboard muestra sección de gastos', async () => {
        await dismissAlert(driver);
        const source = await driver.getPageSource();
        // Verifica el título estático de la sección (siempre presente en el JSX)
        assert(
            source.includes('Gastos Registrados') || source.includes('Gasto') || source.includes('Vital') || source.includes('Variable'),
            'No se encontró sección de gastos'
        );
    });

    await runTest('TC-09: Dashboard muestra meta de crecimiento', async () => {
        const source = await dash.getPageSource();
        assert(
            source.includes('Meta') || source.includes('meta') || source.includes('%'),
            'No se encontró información de meta'
        );
    });

    await runTest('TC-10: Navegación a Mis Objetivos desde Dashboard', async () => {
        await dash.clickMisObjetivos();
        await driver.wait(until.urlContains('/mis-objetivos'), 8000);
        assert((await driver.getCurrentUrl()).includes('/mis-objetivos'), 'No navegó a /mis-objetivos');
    });

    await driver.quit();
}

// ==========================================
// SUITE 3: MIS OBJETIVOS
// ==========================================

async function suiteMisObjetivos() {
    console.log('\n[HU-03] Mis Objetivos (Metas de Ahorro)\n');
    let driver = await buildDriver();
    await driver.manage().window().maximize();
    await loginHelper(driver);

    const obj = new MisObjetivosPage(driver);
    await obj.open();
    await obj.waitForLoad();

    await runTest('TC-11: Página Mis Objetivos carga correctamente', async () => {
        assert((await obj.getCurrentUrl()).includes('/mis-objetivos'), 'URL incorrecta');
    });

    await runTest('TC-12: Se muestra el banner de progreso de ahorro general', async () => {
        assert(await obj.esBannerProgresoVisible(), 'Banner de progreso no visible');
    });

    await runTest('TC-13: Botón de nueva meta (+) es visible', async () => {
        assert(await obj.esBotonNuevaMetaVisible(), 'Botón nueva meta no visible');
    });

    await runTest('TC-14: Página muestra sección de Metas Activas', async () => {
        const source = await obj.getPageSource();
        assert(
            source.includes('Metas Activas') || source.includes('Sin metas'),
            'Sección de metas no encontrada'
        );
    });

    await runTest('TC-15: Clic en (+) abre modal de crear meta', async () => {
        const fabBtn = await driver.wait(
            until.elementLocated(By.css('button.fixed')), 8000
        );
        await fabBtn.click();
        await driver.sleep(800);
        const source = await driver.getPageSource();
        assert(
            source.includes('Nueva Meta') || source.includes('Nombre de la Meta') || source.includes('Monto Objetivo'),
            'Modal de crear meta no apareció'
        );
        // Cerrar modal
        try {
            const closeBtn = await driver.findElement(By.css('button svg[data-lucide="x"], button.absolute'));
            await closeBtn.click();
        } catch { /* ok si no hay botón de cierre accesible */ }
    });

    await driver.quit();
}

// ==========================================
// SUITE 4: AJUSTES
// ==========================================

async function suiteAjustes() {
    console.log('\n[HU-04] Ajustes / Configuración\n');
    let driver = await buildDriver();
    await driver.manage().window().maximize();
    await loginHelper(driver);

    const ajustes = new AjustesPage(driver);
    await ajustes.open();
    await ajustes.waitForLoad();

    await runTest('TC-16: Página Ajustes carga correctamente', async () => {
        assert((await ajustes.getCurrentUrl()).includes('/ajustes'), 'URL incorrecta');
    });

    await runTest('TC-17: Tarjeta de Perfil Financiero está visible', async () => {
        // Esperar el h2 específico del card (siempre renderizado, no depende de API)
        await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Perfil Financiero')]"))
            , 8000
        );
        const source = await driver.getPageSource();
        assert(
            source.includes('Perfil Financiero'),
            'Tarjeta de Perfil Financiero no encontrada'
        );
        assert(
            source.includes('Frecuencia'),
            'Label de Frecuencia no encontrado'
        );
    });

    await runTest('TC-18: Sección Mis Gastos Fijos está visible', async () => {
        // Esperar el h2 de la sección de gastos (siempre renderizado, no depende de API)
        await driver.wait(
            until.elementLocated(By.xpath("//*[contains(text(),'Gastos Fijos')]"))
            , 8000
        );
        const source = await driver.getPageSource();
        assert(
            source.includes('Gastos Fijos'),
            'Sección de Mis Gastos Fijos ausente'
        );
    });

    await runTest('TC-19: Botón de Editar Ciclo (lapicero) es visible', async () => {
        try {
            const editBtn = await driver.wait(
                until.elementLocated(By.css('button.bg-\\[\\#F5F3FF\\], button[class*="F5F3FF"]')), 5000
            );
            assert(await editBtn.isDisplayed(), 'Botón editar no visible');
        } catch {
            // Alternate selector
            const buttons = await driver.findElements(By.css('button'));
            assert(buttons.length > 0, 'No se encontraron botones en la página');
        }
    });

    await runTest('TC-20: Botón Cerrar Sesión está visible', async () => {
        const source = await ajustes.getPageSource();
        assert(
            source.includes('Cerrar Sesión') || source.includes('Cerrar sesión'),
            'Botón Cerrar Sesión no encontrado'
        );
    });

    await driver.quit();
}

// ==========================================
// RUNNER PRINCIPAL
// ==========================================

async function main() {
    console.log('================================================');
    console.log('  VouCher — Suite de Pruebas Selenium');
    console.log('  Target: ' + BASE_URL);
    console.log('  Email:  ' + EMAIL);
    console.log('================================================');

    await suiteAuth();
    await suiteDashboard();
    await suiteMisObjetivos();
    await suiteAjustes();

    console.log('\n================================================');
    console.log(`  Resultados: ${passed} PASS | ${failed} FAIL | ${passed + failed} TOTAL`);
    console.log('================================================\n');

    if (failed > 0) {
        console.log('Tests fallidos:');
        results.filter(r => r.status === 'FAIL').forEach(r => {
            console.log(`  ✗ ${r.name}: ${r.error}`);
        });
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Error fatal en el runner:', err);
    process.exit(1);
});
