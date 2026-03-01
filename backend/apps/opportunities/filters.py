import django_filters
from .models import Opportunity


class OpportunityFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(field_name='opportunity_type', choices=Opportunity.OPPORTUNITY_TYPES)
    required_role = django_filters.ChoiceFilter(choices=Opportunity.REQUIRED_ROLE_CHOICES)
    research_area = django_filters.CharFilter(field_name='research_areas__slug', lookup_expr='exact')
    institution = django_filters.CharFilter(lookup_expr='icontains')
    is_remote = django_filters.BooleanFilter()
    funding_available = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    deadline_after = django_filters.DateFilter(field_name='deadline', lookup_expr='gte')
    deadline_before = django_filters.DateFilter(field_name='deadline', lookup_expr='lte')

    class Meta:
        model = Opportunity
        fields = ['type', 'required_role', 'research_area', 'institution', 'is_remote', 'funding_available', 'is_active']
