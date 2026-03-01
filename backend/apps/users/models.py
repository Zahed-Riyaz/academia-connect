from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.text import slugify


class User(AbstractUser):
    ROLE_CHOICES = [
        ('professor', 'Professor'),
        ('phd_student', 'PhD Student'),
        ('masters_student', 'Masters Student'),
        ('undergraduate', 'Undergraduate'),
        ('independent_researcher', 'Independent Researcher'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'role']

    def __str__(self):
        return self.email


class ResearchInterest(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    institution = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    google_scholar_url = models.URLField(blank=True)
    orcid_id = models.CharField(max_length=25, blank=True)
    linkedin_url = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    research_interests = models.ManyToManyField(ResearchInterest, blank=True, related_name='users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"


class Publication(models.Model):
    PUBLICATION_TYPES = [
        ('journal', 'Journal Article'),
        ('conference', 'Conference Paper'),
        ('preprint', 'Preprint'),
        ('book', 'Book'),
        ('book_chapter', 'Book Chapter'),
        ('thesis', 'Thesis'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='publications')
    title = models.CharField(max_length=500)
    authors = models.CharField(max_length=1000)
    publication_type = models.CharField(max_length=20, choices=PUBLICATION_TYPES)
    venue = models.CharField(max_length=255, blank=True)
    year = models.PositiveSmallIntegerField()
    doi = models.CharField(max_length=200, blank=True)
    url = models.URLField(blank=True)
    abstract = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-created_at']

    def __str__(self):
        return self.title
