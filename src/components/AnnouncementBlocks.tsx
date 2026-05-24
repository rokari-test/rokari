import type { AnnouncementBlock } from '../lib/announcementStore'
import './AnnouncementBlocks.css'

export function AnnouncementBlocks({ blocks }: { blocks: AnnouncementBlock[] }) {
  return (
    <div className="announcement-blocks">
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 key={block.id} className="announcement-blocks-heading">
                {block.text}
              </h2>
            )
          case 'paragraph':
            return (
              <p key={block.id} className="announcement-blocks-p">
                {block.text}
              </p>
            )
          case 'quote':
            return (
              <blockquote key={block.id} className="announcement-blocks-quote">
                {block.text}
              </blockquote>
            )
          case 'image':
            return (
              <figure key={block.id} className="announcement-blocks-figure">
                <img src={block.src} alt={block.alt ?? ''} loading="lazy" />
                {block.caption ? (
                  <figcaption>{block.caption}</figcaption>
                ) : null}
              </figure>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
