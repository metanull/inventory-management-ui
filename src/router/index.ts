import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router'
import Home from '@/views/Home.vue'
import Items from '@/views/Items.vue'
import Partners from '@/views/Partners.vue'
import Projects from '@/views/Projects.vue'
import Tags from '@/views/Tags.vue'
import Pictures from '@/views/Pictures.vue'
import Login from '@/views/Login.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: '/items',
      name: 'items',
      component: Items,
      meta: { requiresAuth: true },
    },
    {
      path: '/items/:id',
      name: 'item-detail',
      component: () => import('@/views/ItemDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/partners',
      name: 'partners',
      component: Partners,
      meta: { requiresAuth: true },
    },
    {
      path: '/partners/:id',
      name: 'partner-detail',
      component: () => import('@/views/PartnerDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects,
      meta: { requiresAuth: true },
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('@/views/ProjectDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/tags',
      name: 'tags',
      component: Tags,
      meta: { requiresAuth: true },
    },
    {
      path: '/tags/:id',
      name: 'tag-detail',
      component: () => import('@/views/TagDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pictures',
      name: 'pictures',
      component: Pictures,
      meta: { requiresAuth: true },
    },
    {
      path: '/pictures/:id',
      name: 'picture-detail',
      component: () => import('@/views/PictureDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Countries
    {
      path: '/countries',
      name: 'countries',
      component: () => import('@/views/Countries.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/countries/:id',
      name: 'country-detail',
      component: () => import('@/views/CountryDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Languages
    {
      path: '/languages',
      name: 'languages',
      component: () => import('@/views/Languages.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/languages/:id',
      name: 'language-detail',
      component: () => import('@/views/LanguageDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Contexts
    {
      path: '/contexts',
      name: 'contexts',
      component: () => import('@/views/Contexts.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contexts/:id',
      name: 'context-detail',
      component: () => import('@/views/ContextDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Image Uploads
    {
      path: '/image-uploads',
      name: 'image-uploads',
      component: () => import('@/views/ImageUploads.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/image-uploads/:id',
      name: 'image-upload-detail',
      component: () => import('@/views/ImageUploadDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Addresses
    {
      path: '/addresses',
      name: 'addresses',
      component: () => import('@/views/Addresses.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/addresses/new',
      name: 'address-create',
      component: () => import('@/views/AddressDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/addresses/:id',
      name: 'address-detail',
      component: () => import('@/views/AddressDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/addresses/:id/edit',
      name: 'address-edit',
      component: () => import('@/views/AddressDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Contacts
    {
      path: '/contacts',
      name: 'contacts',
      component: () => import('@/views/Contacts.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contacts/new',
      name: 'contact-create',
      component: () => import('@/views/ContactDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contacts/:id',
      name: 'contact-detail',
      component: () => import('@/views/ContactDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/contacts/:id/edit',
      name: 'contact-edit',
      component: () => import('@/views/ContactDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Available Images
    {
      path: '/available-images',
      name: 'available-images',
      component: () => import('@/views/AvailableImages.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/available-images/:id',
      name: 'available-image-detail',
      component: () => import('@/views/AvailableImageDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Details
    {
      path: '/details',
      name: 'details',
      component: () => import('@/views/Details.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/details/new',
      name: 'detail-create',
      component: () => import('@/views/DetailDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/details/:id',
      name: 'detail-detail',
      component: () => import('@/views/DetailDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/details/:id/edit',
      name: 'detail-edit',
      component: () => import('@/views/DetailDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Authors
    {
      path: '/authors',
      name: 'authors',
      component: () => import('@/views/Authors.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/authors/new',
      name: 'author-create',
      component: () => import('@/views/AuthorDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/authors/:id',
      name: 'author-detail',
      component: () => import('@/views/AuthorDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/authors/:id/edit',
      name: 'author-edit',
      component: () => import('@/views/AuthorDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Artists
    {
      path: '/artists',
      name: 'artists',
      component: () => import('@/views/Artists.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/artists/new',
      name: 'artist-create',
      component: () => import('@/views/ArtistDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/artists/:id',
      name: 'artist-detail',
      component: () => import('@/views/ArtistDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/artists/:id/edit',
      name: 'artist-edit',
      component: () => import('@/views/ArtistDetail.vue'),
      meta: { requiresAuth: true },
    },
    // Workshops
    {
      path: '/workshops',
      name: 'workshops',
      component: () => import('@/views/Workshops.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workshops/new',
      name: 'workshop-create',
      component: () => import('@/views/WorkshopDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workshops/:id',
      name: 'workshop-detail',
      component: () => import('@/views/WorkshopDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workshops/:id/edit',
      name: 'workshop-edit',
      component: () => import('@/views/WorkshopDetail.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else if (to.name === 'login' && authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
  }
)

export default router
