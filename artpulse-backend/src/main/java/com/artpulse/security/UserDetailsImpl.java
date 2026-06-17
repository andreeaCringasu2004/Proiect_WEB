package com.artpulse.security;

import com.artpulse.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String fullName;
    private Collection<? extends GrantedAuthority> authorities;
    private boolean enabled;

    public UserDetailsImpl(Long id, String email, String password, String fullName, Collection<? extends GrantedAuthority> authorities, boolean enabled) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.authorities = authorities;
        this.enabled = enabled;
    }

    public static UserDetailsImpl build(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        boolean isEnabled = user.getStatus() == com.artpulse.entity.enums.UserStatus.ACTIVE;

        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getFullName(),
                Collections.singletonList(authority),
                isEnabled
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email; // We use email as username
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // We can integrate UserStatus here later if needed
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
