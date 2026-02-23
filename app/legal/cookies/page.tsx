import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Cookies | EchoMail",
  description: "Política de cookies de EchoMail - Uso de cookies y almacenamiento local",
}

export default function CookiesPage() {
  return (
    <article className="prose prose-neutral prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-neutral-800 prose-li:text-neutral-800 prose-p:leading-relaxed prose-p:mb-4 [&_ul]:my-4 [&_h2]:mt-10 [&_h2]:mb-4">
      <h1 className="text-2xl sm:text-3xl mb-2">Política de Cookies</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Última actualización: {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <h2>1. Qué son las cookies</h2>
      <p>
        Las cookies son pequeños archivos de texto que los sitios web almacenan en el dispositivo del usuario. EchoMail utiliza además <strong>localStorage</strong> del navegador para almacenar datos de manera persistente en el dispositivo del usuario.
      </p>

      <h2>2. Cookies y almacenamiento que utiliza EchoMail</h2>
      <p>
        EchoMail utiliza las siguientes categorías. En particular, el <strong>localStorage</strong> se emplea para guardar:
      </p>
      <ul>
        <li>
          <strong>Perfil del usuario:</strong> nombre, foto de perfil y logo que el usuario suba voluntariamente.
        </li>
        <li>
          <strong>Marca comercial:</strong> la marca que el usuario configure para personalizar los correos generados.
        </li>
        <li>
          <strong>Configuración del usuario:</strong> preferencia de idioma, tema visual, consentimiento legal y otras opciones de la aplicación.
        </li>
      </ul>
      <p>
        Estos datos permanecen en el dispositivo del usuario y no se transmiten a servidores externos salvo en el contexto de la prestación del servicio de IA (por ejemplo, transcripción y generación de correos).
      </p>

      <h2>3. Base legal</h2>
      <p>
        Las cookies técnicas se utilizan en base al interés legítimo de ofrecer un servicio funcional. Las cookies de preferencias y analíticas requieren, cuando la normativa lo exija, tu consentimiento previo.
      </p>

      <h2>4. Gestión de cookies</h2>
      <p>
        Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que ello puede afectar al correcto funcionamiento de EchoMail, especialmente en lo relativo a la conservación de tu perfil y preferencias.
      </p>

      <h2>5. Conservación</h2>
      <p>
        Los datos almacenados en localStorage permanecen hasta que el usuario los elimine manualmente o borre los datos del sitio en la configuración del navegador.
      </p>

      <h2>6. Más información</h2>
      <p>
        Para cualquier duda sobre el uso de cookies y localStorage en EchoMail, puedes contactar con Petit Restauració S.L. en hola@echomail.tonimont.com.
      </p>
    </article>
  )
}
