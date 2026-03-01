from django.db import models
from django.conf import settings


class Opportunity(models.Model):
    OPPORTUNITY_TYPES = [
        ('ra_position', 'Research Assistant Position'),
        ('phd_opening', 'PhD Opening'),
        ('masters_opening', 'Masters Opening'),
        ('postdoc', 'Postdoc Position'),
        ('collaboration', 'Collaboration Request'),
        ('project', 'Project Announcement'),
        ('internship', 'Research Internship'),
        ('other', 'Other'),
    ]

    REQUIRED_ROLE_CHOICES = [
        ('any', 'Any'),
        ('professor', 'Professor'),
        ('phd_student', 'PhD Student'),
        ('masters_student', 'Masters Student'),
        ('undergraduate', 'Undergraduate'),
        ('independent_researcher', 'Independent Researcher'),
    ]

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='opportunities')
    opportunity_type = models.CharField(max_length=30, choices=OPPORTUNITY_TYPES)
    title = models.CharField(max_length=300)
    description = models.TextField()
    institution = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    is_remote = models.BooleanField(default=False)
    required_role = models.CharField(max_length=30, choices=REQUIRED_ROLE_CHOICES, default='any')
    research_areas = models.ManyToManyField('users.ResearchInterest', blank=True, related_name='opportunities')
    funding_available = models.BooleanField(default=False)
    stipend_details = models.CharField(max_length=255, blank=True)
    deadline = models.DateField(null=True, blank=True)
    contact_email = models.EmailField(blank=True)
    external_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['opportunity_type', 'is_active']),
            models.Index(fields=['author', 'created_at']),
        ]

    def __str__(self):
        return f"[{self.opportunity_type}] {self.title}"


class OpportunityBookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'opportunity')
