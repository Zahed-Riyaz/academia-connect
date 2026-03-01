import django_filters
from .models import User


class UserFilter(django_filters.FilterSet):
    role = django_filters.ChoiceFilter(choices=User.ROLE_CHOICES)
    institution = django_filters.CharFilter(field_name='profile__institution', lookup_expr='icontains')
    research_interest = django_filters.CharFilter(field_name='profile__research_interests__slug', lookup_expr='exact')

    class Meta:
        model = User
        fields = ['role', 'institution', 'research_interest']
