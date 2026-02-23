import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aviso Legal | EchoMail",
  description: "Aviso legal de EchoMail - Información legal del servicio",
}

export default function AvisoLegalPage() {
  return (
    <article className="prose prose-neutral prose-lg max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-neutral-800 prose-li:text-neutral-800 prose-p:leading-relaxed prose-p:mb-4 [&_ul]:my-4 [&_h2]:mt-10 [&_h2]:mb-4">
      <h1 className="text-2xl sm:text-3xl mb-2">Aviso Legal</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Última actualización: {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <h2>1. Datos identificativos</h2>
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos:
      </p>
      <ul>
        <li><strong>Denominación social:</strong> Petit Restauració S.L.</li>
        <li><strong>NIF/CIF:</strong> B64903495</li>
        <li><strong>Domicilio social:</strong> C/ Riera Nº 10, 08393 Caldes d&apos;Estrac, Barcelona</li>
        <li><strong>Dominio:</strong> echomail.tonimont.com</li>
        <li><strong>Correo electrónico:</strong> hola@echomail.tonimont.com</li>
      </ul>

      <h2>2. Objeto</h2>
      <p>
        El presente aviso legal regula el uso del sitio web y de la aplicación EchoMail (en adelante, la «Aplicación»), que permite a los usuarios crear correos electrónicos mediante grabación de voz y generación asistida por inteligencia artificial.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        El acceso y la utilización de EchoMail implican la aceptación plena de las presentes condiciones. El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que EchoMail ofrece, y en particular a no emplearlos para actividades ilícitas o contrarias a la buena fe.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        EchoMail es titular o cuenta con las licencias necesarias sobre los derechos de propiedad intelectual e industrial de la Aplicación, así como de los contenidos que la integran. Queda expresamente prohibida la reproducción, distribución y comunicación pública de dichos contenidos sin autorización.
      </p>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        EchoMail no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de la utilización de los servicios o contenidos ofrecidos. Los textos generados por la herramienta de IA son asistenciales y deben ser revisados por el usuario antes de su uso.
      </p>

      <h2>6. Legislación aplicable y jurisdicción</h2>
      <p>
        Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales del domicilio del usuario consumidor.
      </p>
    </article>
  )
}
