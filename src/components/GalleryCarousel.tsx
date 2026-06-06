import { useState, useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface GalleryCarouselProps {
  images: { url: string; alt?: string; orden: number }[]
  title: string
  categoria?: string
}

const fallbackImage =
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800'

export function GalleryCarousel({ images, title, categoria }: GalleryCarouselProps) {
  const imagesList = images?.length ? images : []
  const hasImages = imagesList.length > 0

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i === 0 ? imagesList.length - 1 : i - 1))
  }, [imagesList.length])

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i === imagesList.length - 1 ? 0 : i + 1))
  }, [imagesList.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowLeft') lightboxPrev()
      else if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, lightboxPrev, lightboxNext])

  useEffect(() => {
    if (lightboxOpen || !hasImages) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') emblaApi?.scrollPrev()
      else if (e.key === 'ArrowRight') emblaApi?.scrollNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, hasImages, emblaApi])

  if (!hasImages) {
    return (
      <div className="relative h-72 overflow-hidden rounded-2xl bg-muted shadow-lg sm:h-96">
        <img
          src={fallbackImage}
          alt="Imagen por defecto"
          className="size-full object-cover"
        />
        {categoria && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {categoria}
            </Badge>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="relative h-72 overflow-hidden rounded-2xl bg-muted shadow-lg sm:h-96">
        <div className="size-full" ref={emblaRef}>
          <div className="flex size-full">
            {imagesList.map((img, i) => (
              <div
                key={i}
                className="relative min-w-0 shrink-0 grow-0 basis-full cursor-pointer"
                role="group"
                aria-roledescription="slide"
                aria-label={`Imagen ${i + 1} de ${imagesList.length}`}
                onClick={() => {
                  setLightboxIndex(i)
                  setLightboxOpen(true)
                }}
              >
                <img
                  src={img.url}
                  alt={img.alt || title}
                  className="size-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

        {imagesList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                emblaApi?.scrollPrev()
              }}
              className="btn-press absolute left-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-ring"
              style={{ width: 44, height: 44 }}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                emblaApi?.scrollNext()
              }}
              className="btn-press absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-background/90 focus-visible:ring-2 focus-visible:ring-ring"
              style={{ width: 44, height: 44 }}
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {imagesList.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-10 flex gap-1.5">
            {imagesList.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  scrollTo(i)
                }}
                className={cn(
                  'pointer-events-auto size-2 rounded-full transition-all',
                  i === selectedIndex ? 'scale-125 bg-white' : 'bg-white/50'
                )}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        )}

        {imagesList.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-background/60 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            {selectedIndex + 1} / {imagesList.length}
          </div>
        )}

        {categoria && (
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {categoria}
            </Badge>
          </div>
        )}
      </div>

      {imagesList.length > 1 && (
        <div className="mt-2 hidden gap-2 overflow-x-auto sm:flex">
          {imagesList.map((img, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:ring-2 focus-visible:ring-ring',
                i === selectedIndex
                  ? 'border-primary opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-80'
              )}
              style={{ width: 72, height: 48 }}
              aria-label={`Seleccionar imagen ${i + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt || `${title} - miniatura ${i + 1}`}
                className="size-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen ampliada"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 flex items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
            style={{ width: 44, height: 44 }}
            aria-label="Cerrar visor"
          >
            <X size={24} />
          </button>

          {imagesList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  lightboxPrev()
                }}
                className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                style={{ width: 44, height: 44 }}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  lightboxNext()
                }}
                className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
                style={{ width: 44, height: 44 }}
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <img
            src={imagesList[lightboxIndex].url}
            alt={imagesList[lightboxIndex].alt || title}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {imagesList.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {lightboxIndex + 1} / {imagesList.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
