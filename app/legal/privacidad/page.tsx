import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad | EchoMail",
  description: "Política de privacidad de EchoMail - Cómo tratamos tus datos",
}

export default function PrivacidadPage() {
  return (
    <article className="prose prose-neutral prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-neutral-800 prose-li:text-neutral-800 prose-p:leading-relaxed prose-p:mb-4 [&_ul]:my-4 [&_h2]:mt-10 [&_h2]:mb-4">
      <h1 className="text-2xl sm:text-3xl mb-2">Política de Privacidad</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Última actualización: {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales que facilites a través de EchoMail es <strong>Petit Restauració S.L.</strong>, con domicilio en C/ Riera Nº 10, 08393 Caldes d&apos;Estrac, Barcelona, y correo electrónico de contacto hola@echomail.tonimont.com.
      </p>

      <h2>2. Datos que recabamos</h2>
      <p>
        EchoMail puede tratar los siguientes datos en función del uso de la aplicación para ofrecer el servicio de inteligencia artificial:
      </p>
      <ul>
        <li><strong>Datos de perfil:</strong> nombre, marca comercial, foto de perfil y logo que el usuario suba voluntariamente.</li>
        <li><strong>Datos de uso:</strong> grabaciones de voz, transcripciones y correos generados para ofrecer el servicio.</li>
        <li><strong>Datos técnicos:</strong> preferencias de idioma, tema y configuración almacenados localmente.</li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>
        Los datos se tratan para ofrecer el servicio de IA de EchoMail: generación de correos electrónicos mediante voz e inteligencia artificial, personalización de la experiencia del usuario (perfil, marca, preferencias) y mejora del funcionamiento de la aplicación.
      </p>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento se basa en el consentimiento del usuario, la ejecución del contrato de prestación del servicio y, cuando corresponda, el interés legítimo del responsable.
      </p>

      <h2>5. Conservación</h2>
      <p>
        Los datos se conservarán mientras se mantenga la relación contractual o el usuario no solicite su supresión. Los datos almacenados localmente (por ejemplo en el navegador) permanecen bajo control del usuario.
      </p>

      <h2>6. Destinatarios y transferencias</h2>
      <p>
        Los datos podrán ser comunicados a proveedores tecnológicos que participen en la prestación del servicio (por ejemplo, servicios de transcripción o generación de texto con IA), siempre bajo las garantías adecuadas.
      </p>

      <h2>7. Derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición dirigiéndote a Petit Restauració S.L. en hola@echomail.tonimont.com. También tienes derecho a reclamar ante la autoridad de control (AEPD en España).
      </p>

      <h2>8. Seguridad</h2>
      <p>
        EchoMail adopta medidas técnicas y organizativas adecuadas para proteger los datos personales frente a accesos no autorizados, pérdida o alteración.
      </p>
    </article>
  )
}
