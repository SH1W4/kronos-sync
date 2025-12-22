'use server'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DOCS_DIR = path.join(process.cwd(), 'docs')

export async function getDocumentation(role: string = 'ARTIST', email: string | null = null) {
    const categories = ['training', 'governance', 'templates', 'dev']
    const allDocs: any[] = []

    // O e-mail mestre para acesso root/dev
    const DEV_EMAIL = 'joao@kronosync.com'

    for (const category of categories) {
        const categoryPath = path.join(DOCS_DIR, category)
        if (!fs.existsSync(categoryPath)) continue

        const files = fs.readdirSync(categoryPath)
        for (const file of files) {
            if (!file.endsWith('.md')) continue

            const filePath = path.join(categoryPath, file)
            const content = fs.readFileSync(filePath, 'utf-8')
            const { data, content: markdown } = matter(content)

            const docAudience = data.docsync?.audience || 'artist'

            // Camada de Sigilo: 
            // 1. Se o doc é admin-only e o usuário não é ADMIN, pular.
            if (docAudience === 'admin' && role !== 'ADMIN') continue

            // 2. Se o doc é dev-only e o e-mail não é o do desenvolvedor, pular.
            if (docAudience === 'dev' && email !== DEV_EMAIL) continue

            allDocs.push({
                id: file.replace('.md', ''),
                title: data.title || file.replace('.md', '').replace(/-/g, ' ').toUpperCase(),
                category,
                content: markdown,
                metadata: data.docsync || {}
            })
        }
    }

    return allDocs
}
